package com.gastrosmart.bluetooth.model

/**
 * Unified model representing a discovered Bluetooth device (Classic or BLE).
 */
data class BluetoothDeviceModel(
    /** Human-readable name broadcast by the device, or "Unknown Device" */
    val name: String,
    /** MAC address in format AA:BB:CC:DD:EE:FF */
    val address: String,
    /** Received Signal Strength Indicator in dBm (typically -100 to 0) */
    val rssi: Int,
    val type: BluetoothType,
    /** true once a GATT/socket connection is established */
    val isConnected: Boolean = false,
)

enum class BluetoothType { CLASSIC, BLE }

/** Signal quality bucket derived from RSSI value */
enum class SignalStrength {
    EXCELLENT,  // >= -60 dBm
    GOOD,       // -60 to -70 dBm
    FAIR,       // -70 to -80 dBm
    WEAK;       // < -80 dBm

    companion object {
        fun from(rssi: Int): SignalStrength = when {
            rssi >= -60 -> EXCELLENT
            rssi >= -70 -> GOOD
            rssi >= -80 -> FAIR
            else        -> WEAK
        }
    }
}

/** A generic command sent to the connected device */
sealed class DeviceCommand {
    object TurnOn  : DeviceCommand()
    object TurnOff : DeviceCommand()
    /** Arbitrary value command, e.g. slider position 0-100 */
    data class SetValue(val value: Int) : DeviceCommand()
    /** Raw bytes for advanced use-cases */
    data class Raw(val bytes: ByteArray) : DeviceCommand() {
        override fun equals(other: Any?) =
            other is Raw && bytes.contentEquals(other.bytes)
        override fun hashCode() = bytes.contentHashCode()
    }
}

/** Result wrapper for all Bluetooth operations */
sealed class BluetoothResult<out T> {
    data class Success<T>(val data: T) : BluetoothResult<T>()
    data class Error(val message: String, val cause: Throwable? = null) : BluetoothResult<Nothing>()
}
