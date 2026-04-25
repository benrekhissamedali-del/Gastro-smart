package com.gastrosmart.bluetooth.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Build
import com.gastrosmart.bluetooth.model.BluetoothDeviceModel
import com.gastrosmart.bluetooth.model.BluetoothResult
import com.gastrosmart.bluetooth.model.BluetoothType
import com.gastrosmart.bluetooth.model.DeviceCommand
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

// Standard BLE service/characteristic UUIDs used by many devices
private val GENERIC_ATTRIBUTE_SERVICE  = UUID.fromString("00001801-0000-1000-8000-00805f9b34fb")
private val GENERIC_ACCESS_SERVICE     = UUID.fromString("00001800-0000-1000-8000-00805f9b34fb")
private val SERIAL_PORT_SERVICE_UUID   = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e") // Nordic UART
private val SERIAL_RX_CHAR_UUID        = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e") // Write
private val SERIAL_TX_CHAR_UUID        = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e") // Notify
private val CLIENT_CHAR_CONFIG_UUID    = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb") // CCCD

@SuppressLint("MissingPermission")
class BleManager(private val context: Context) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter  get() = bluetoothManager.adapter
    private val bleScanner        get() = bluetoothAdapter?.bluetoothLeScanner

    private var gatt: BluetoothGatt? = null
    private var writeCharacteristic: BluetoothGattCharacteristic? = null

    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _receivedData = MutableStateFlow<ByteArray?>(null)
    val receivedData: StateFlow<ByteArray?> = _receivedData.asStateFlow()

    // ── Scan ──────────────────────────────────────────────────────────────────

    /**
     * Emits discovered BLE devices as a cold Flow.
     * The scan stops automatically when the collector is cancelled.
     */
    fun scanDevices(): Flow<BluetoothDeviceModel> = callbackFlow {
        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = result.device
                trySend(
                    BluetoothDeviceModel(
                        name    = device.name ?: "Unknown Device",
                        address = device.address,
                        rssi    = result.rssi,
                        type    = BluetoothType.BLE,
                    )
                )
            }

            override fun onScanFailed(errorCode: Int) {
                close(ScanException("BLE scan failed with code $errorCode"))
            }
        }

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        bleScanner?.startScan(emptyList<ScanFilter>(), settings, callback)

        awaitClose { bleScanner?.stopScan(callback) }
    }

    // ── Connection ────────────────────────────────────────────────────────────

    fun connect(device: BluetoothDeviceModel): Flow<ConnectionState> = callbackFlow {
        _connectionState.value = ConnectionState.Connecting
        trySend(ConnectionState.Connecting)

        val androidDevice = bluetoothAdapter?.getRemoteDevice(device.address)
            ?: run {
                trySend(ConnectionState.Error("Device not found"))
                close()
                return@callbackFlow
            }

        val gattCallback = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
                when (newState) {
                    BluetoothProfile.STATE_CONNECTED -> {
                        _connectionState.value = ConnectionState.Discovering
                        trySend(ConnectionState.Discovering)
                        gatt.discoverServices()
                    }
                    BluetoothProfile.STATE_DISCONNECTED -> {
                        val state = if (status == BluetoothGatt.GATT_SUCCESS)
                            ConnectionState.Disconnected
                        else
                            ConnectionState.Error("Disconnected with status $status")
                        _connectionState.value = state
                        trySend(state)
                        close()
                    }
                }
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) {
                    val err = ConnectionState.Error("Service discovery failed: $status")
                    _connectionState.value = err
                    trySend(err)
                    return
                }
                writeCharacteristic = gatt.findWriteCharacteristic()
                enableNotifications(gatt)
                val state = ConnectionState.Connected
                _connectionState.value = state
                trySend(state)
            }

            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
            ) {
                _receivedData.value = characteristic.value
            }

            // Android 13+ override
            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                value: ByteArray,
            ) {
                _receivedData.value = value
            }
        }

        gatt = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            androidDevice.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        } else {
            androidDevice.connectGatt(context, false, gattCallback)
        }

        awaitClose { /* GATT is closed in disconnect() */ }
    }

    fun disconnect() {
        gatt?.disconnect()
        gatt?.close()
        gatt = null
        writeCharacteristic = null
        _connectionState.value = ConnectionState.Disconnected
    }

    // ── Send command ──────────────────────────────────────────────────────────

    fun sendCommand(command: DeviceCommand): BluetoothResult<Unit> {
        val bytes = command.toBytes()
        val characteristic = writeCharacteristic
            ?: return BluetoothResult.Error("Not connected or characteristic not found")

        return writeBytes(characteristic, bytes)
    }

    private fun writeBytes(
        characteristic: BluetoothGattCharacteristic,
        bytes: ByteArray,
    ): BluetoothResult<Unit> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val result = gatt?.writeCharacteristic(
                characteristic,
                bytes,
                BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT,
            )
            if (result == BluetoothStatusCodes.SUCCESS) BluetoothResult.Success(Unit)
            else BluetoothResult.Error("Write failed with code $result")
        } else {
            @Suppress("DEPRECATION")
            characteristic.value = bytes
            @Suppress("DEPRECATION")
            val ok = gatt?.writeCharacteristic(characteristic) ?: false
            if (ok) BluetoothResult.Success(Unit)
            else BluetoothResult.Error("Write characteristic returned false")
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun BluetoothGatt.findWriteCharacteristic(): BluetoothGattCharacteristic? {
        // Try Nordic UART RX first, then scan all writable characteristics
        getService(SERIAL_PORT_SERVICE_UUID)
            ?.getCharacteristic(SERIAL_RX_CHAR_UUID)
            ?.let { return it }

        for (service in services) {
            for (char in service.characteristics) {
                val props = char.properties
                if (props and BluetoothGattCharacteristic.PROPERTY_WRITE != 0 ||
                    props and BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE != 0
                ) return char
            }
        }
        return null
    }

    private fun enableNotifications(gatt: BluetoothGatt) {
        val notifyChar = gatt.getService(SERIAL_PORT_SERVICE_UUID)
            ?.getCharacteristic(SERIAL_TX_CHAR_UUID) ?: return

        gatt.setCharacteristicNotification(notifyChar, true)

        val descriptor = notifyChar.getDescriptor(CLIENT_CHAR_CONFIG_UUID) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            gatt.writeDescriptor(descriptor, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
        } else {
            @Suppress("DEPRECATION")
            descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
            @Suppress("DEPRECATION")
            gatt.writeDescriptor(descriptor)
        }
    }
}

// ── Supporting types ──────────────────────────────────────────────────────────

sealed class ConnectionState {
    object Disconnected : ConnectionState()
    object Connecting   : ConnectionState()
    object Discovering  : ConnectionState()
    object Connected    : ConnectionState()
    data class Error(val message: String) : ConnectionState()
}

class ScanException(message: String) : Exception(message)

/** Encode a [DeviceCommand] as a byte array suitable for UART transmission */
private fun DeviceCommand.toBytes(): ByteArray = when (this) {
    is DeviceCommand.TurnOn      -> byteArrayOf(0x01)
    is DeviceCommand.TurnOff     -> byteArrayOf(0x00)
    is DeviceCommand.SetValue    -> byteArrayOf(0x02, value.coerceIn(0, 255).toByte())
    is DeviceCommand.Raw         -> bytes
}
