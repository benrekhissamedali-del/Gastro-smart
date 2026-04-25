package com.gastrosmart.bluetooth.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.gastrosmart.bluetooth.model.BluetoothDeviceModel
import com.gastrosmart.bluetooth.model.BluetoothResult
import com.gastrosmart.bluetooth.model.BluetoothType
import com.gastrosmart.bluetooth.model.DeviceCommand
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

// SPP UUID used by virtually all Classic Bluetooth serial devices (HC-05, HC-06, etc.)
private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

@SuppressLint("MissingPermission")
class ClassicBluetoothManager(private val context: Context) {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()

    private var socket: BluetoothSocket? = null
    private var inputStream: InputStream?  = null
    private var outputStream: OutputStream? = null

    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    // ── Discovery ─────────────────────────────────────────────────────────────

    /**
     * Emits paired devices immediately, then discovered devices as a Flow.
     * Discovery stops when the collector is cancelled.
     */
    fun scanDevices(): Flow<BluetoothDeviceModel> = callbackFlow {
        // Emit already-paired devices first
        bluetoothAdapter?.bondedDevices?.forEach { device ->
            trySend(device.toModel(rssi = 0))
        }

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    BluetoothDevice.ACTION_FOUND -> {
                        val device = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                        } else {
                            @Suppress("DEPRECATION")
                            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                        }
                        val rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE).toInt()
                        device?.let { trySend(it.toModel(rssi)) }
                    }
                    BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
                        close()
                    }
                }
            }
        }

        val filter = IntentFilter().apply {
            addAction(BluetoothDevice.ACTION_FOUND)
            addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
        }
        context.registerReceiver(receiver, filter)
        bluetoothAdapter?.startDiscovery()

        awaitClose {
            bluetoothAdapter?.cancelDiscovery()
            try { context.unregisterReceiver(receiver) } catch (_: IllegalArgumentException) {}
        }
    }

    // ── Connection ────────────────────────────────────────────────────────────

    /**
     * Opens an SPP socket to the given device on an IO dispatcher.
     * Always cancels Bluetooth discovery before connecting (required for stability).
     */
    suspend fun connect(device: BluetoothDeviceModel): BluetoothResult<Unit> =
        withContext(Dispatchers.IO) {
            _connectionState.value = ConnectionState.Connecting
            try {
                bluetoothAdapter?.cancelDiscovery()
                val remoteDevice = bluetoothAdapter?.getRemoteDevice(device.address)
                    ?: return@withContext BluetoothResult.Error("Adapter unavailable")

                val s = remoteDevice.createRfcommSocketToServiceRecord(SPP_UUID)
                s.connect()
                socket       = s
                inputStream  = s.inputStream
                outputStream = s.outputStream
                _connectionState.value = ConnectionState.Connected
                BluetoothResult.Success(Unit)
            } catch (e: Exception) {
                _connectionState.value = ConnectionState.Error(e.message ?: "Connection failed")
                disconnect()
                BluetoothResult.Error(e.message ?: "Connection failed", e)
            }
        }

    fun disconnect() {
        try {
            inputStream?.close()
            outputStream?.close()
            socket?.close()
        } catch (_: Exception) {}
        socket       = null
        inputStream  = null
        outputStream = null
        _connectionState.value = ConnectionState.Disconnected
    }

    // ── Send command ──────────────────────────────────────────────────────────

    suspend fun sendCommand(command: DeviceCommand): BluetoothResult<Unit> =
        withContext(Dispatchers.IO) {
            val out = outputStream
                ?: return@withContext BluetoothResult.Error("Not connected")
            try {
                out.write(command.toBytes())
                out.flush()
                BluetoothResult.Success(Unit)
            } catch (e: Exception) {
                BluetoothResult.Error(e.message ?: "Write failed", e)
            }
        }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun BluetoothDevice.toModel(rssi: Int) = BluetoothDeviceModel(
        name    = name ?: "Unknown Device",
        address = address,
        rssi    = rssi,
        type    = BluetoothType.CLASSIC,
    )
}

/** Encode a [DeviceCommand] as ASCII bytes for Classic UART devices (Arduino, HC-05 …) */
private fun DeviceCommand.toBytes(): ByteArray = when (this) {
    is DeviceCommand.TurnOn   -> "ON\n".toByteArray(Charsets.UTF_8)
    is DeviceCommand.TurnOff  -> "OFF\n".toByteArray(Charsets.UTF_8)
    is DeviceCommand.SetValue -> "VAL:$value\n".toByteArray(Charsets.UTF_8)
    is DeviceCommand.Raw      -> bytes
}
