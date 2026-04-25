package com.gastrosmart.bluetooth.viewmodel

import android.annotation.SuppressLint
import android.app.Application
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gastrosmart.bluetooth.bluetooth.BleManager
import com.gastrosmart.bluetooth.bluetooth.ClassicBluetoothManager
import com.gastrosmart.bluetooth.bluetooth.ConnectionState
import com.gastrosmart.bluetooth.model.BluetoothDeviceModel
import com.gastrosmart.bluetooth.model.BluetoothResult
import com.gastrosmart.bluetooth.model.BluetoothType
import com.gastrosmart.bluetooth.model.DeviceCommand
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@SuppressLint("MissingPermission")
class BluetoothViewModel(application: Application) : AndroidViewModel(application) {

    private val context: Context = application.applicationContext

    private val bleManager     = BleManager(context)
    private val classicManager = ClassicBluetoothManager(context)

    private val bluetoothAdapter: BluetoothAdapter? =
        (context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter

    // ── UI state ──────────────────────────────────────────────────────────────

    private val _uiState = MutableStateFlow(BluetoothUiState())
    val uiState: StateFlow<BluetoothUiState> = _uiState.asStateFlow()

    private var scanJob: Job? = null
    private var connectJob: Job? = null

    init {
        // Mirror BLE + Classic connection state into unified UI state
        viewModelScope.launch {
            bleManager.connectionState.collect { state ->
                if (_uiState.value.selectedDevice?.type == BluetoothType.BLE) {
                    _uiState.update { it.copy(connectionState = state.toUiConnectionState()) }
                }
            }
        }
        viewModelScope.launch {
            classicManager.connectionState.collect { state ->
                if (_uiState.value.selectedDevice?.type == BluetoothType.CLASSIC) {
                    _uiState.update { it.copy(connectionState = state.toUiConnectionState()) }
                }
            }
        }
    }

    // ── Bluetooth availability ────────────────────────────────────────────────

    val isBluetoothEnabled: Boolean
        get() = bluetoothAdapter?.isEnabled == true

    // ── Scan ──────────────────────────────────────────────────────────────────

    fun startScan(type: BluetoothType = BluetoothType.BLE) {
        scanJob?.cancel()
        _uiState.update { it.copy(isScanning = true, discoveredDevices = emptyList(), error = null) }

        scanJob = viewModelScope.launch {
            val flow = when (type) {
                BluetoothType.BLE     -> bleManager.scanDevices()
                BluetoothType.CLASSIC -> classicManager.scanDevices()
            }

            flow
                .catch { e -> _uiState.update { it.copy(error = e.message, isScanning = false) } }
                .collect { device ->
                    _uiState.update { state ->
                        val updated = state.discoveredDevices
                            .filterNot { it.address == device.address } + device
                        state.copy(discoveredDevices = updated.sortedByDescending { it.rssi })
                    }
                }

            _uiState.update { it.copy(isScanning = false) }
        }
    }

    fun stopScan() {
        scanJob?.cancel()
        scanJob = null
        _uiState.update { it.copy(isScanning = false) }
    }

    // ── Connection ────────────────────────────────────────────────────────────

    fun connectToDevice(device: BluetoothDeviceModel) {
        connectJob?.cancel()
        stopScan()

        _uiState.update {
            it.copy(
                selectedDevice    = device,
                connectionState   = UiConnectionState.CONNECTING,
                error             = null,
            )
        }

        connectJob = viewModelScope.launch {
            when (device.type) {
                BluetoothType.BLE -> {
                    bleManager.connect(device).collect { state ->
                        _uiState.update { it.copy(connectionState = state.toUiConnectionState()) }
                    }
                }
                BluetoothType.CLASSIC -> {
                    val result = classicManager.connect(device)
                    if (result is BluetoothResult.Error) {
                        _uiState.update {
                            it.copy(
                                error           = result.message,
                                connectionState = UiConnectionState.ERROR,
                            )
                        }
                    }
                }
            }
        }
    }

    fun disconnect() {
        connectJob?.cancel()
        bleManager.disconnect()
        classicManager.disconnect()
        _uiState.update {
            it.copy(
                selectedDevice  = null,
                connectionState = UiConnectionState.DISCONNECTED,
            )
        }
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    fun sendCommand(command: DeviceCommand) {
        val device = _uiState.value.selectedDevice ?: return

        viewModelScope.launch {
            val result = when (device.type) {
                BluetoothType.BLE     -> bleManager.sendCommand(command)
                BluetoothType.CLASSIC -> classicManager.sendCommand(command)
            }

            if (result is BluetoothResult.Error) {
                _uiState.update { it.copy(error = result.message) }
            } else {
                // Optimistically update slider / power state in UI
                when (command) {
                    is DeviceCommand.TurnOn   -> _uiState.update { it.copy(devicePowerOn = true) }
                    is DeviceCommand.TurnOff  -> _uiState.update { it.copy(devicePowerOn = false) }
                    is DeviceCommand.SetValue -> _uiState.update { it.copy(sliderValue = command.value) }
                    else                      -> Unit
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    override fun onCleared() {
        super.onCleared()
        bleManager.disconnect()
        classicManager.disconnect()
    }
}

// ── UI state data classes ─────────────────────────────────────────────────────

data class BluetoothUiState(
    val isScanning: Boolean        = false,
    val discoveredDevices: List<BluetoothDeviceModel> = emptyList(),
    val selectedDevice: BluetoothDeviceModel?         = null,
    val connectionState: UiConnectionState            = UiConnectionState.DISCONNECTED,
    val devicePowerOn: Boolean     = false,
    val sliderValue: Int           = 0,
    val error: String?             = null,
)

enum class UiConnectionState { DISCONNECTED, CONNECTING, DISCOVERING, CONNECTED, ERROR }

private fun ConnectionState.toUiConnectionState(): UiConnectionState = when (this) {
    is ConnectionState.Disconnected -> UiConnectionState.DISCONNECTED
    is ConnectionState.Connecting   -> UiConnectionState.CONNECTING
    is ConnectionState.Discovering  -> UiConnectionState.DISCOVERING
    is ConnectionState.Connected    -> UiConnectionState.CONNECTED
    is ConnectionState.Error        -> UiConnectionState.ERROR
}
