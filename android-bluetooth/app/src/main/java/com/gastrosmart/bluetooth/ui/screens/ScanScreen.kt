package com.gastrosmart.bluetooth.ui.screens

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.content.Intent
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import com.gastrosmart.bluetooth.model.BluetoothDeviceModel
import com.gastrosmart.bluetooth.model.BluetoothType
import com.gastrosmart.bluetooth.model.SignalStrength
import com.gastrosmart.bluetooth.ui.theme.*
import com.gastrosmart.bluetooth.viewmodel.BluetoothViewModel
import com.gastrosmart.bluetooth.viewmodel.BluetoothUiState

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScanScreen(
    viewModel: BluetoothViewModel,
    onDeviceSelected: (BluetoothDeviceModel) -> Unit,
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // ── Runtime permission request ────────────────────────────────────────────
    val permissions = buildList {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            add(Manifest.permission.BLUETOOTH_SCAN)
            add(Manifest.permission.BLUETOOTH_CONNECT)
        } else {
            add(Manifest.permission.BLUETOOTH)
            add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }
    val permissionsState = rememberMultiplePermissionsState(permissions)

    // ── Enable-Bluetooth launcher ─────────────────────────────────────────────
    val enableBtLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { /* result handled via uiState */ }

    // ── Selected scan type ────────────────────────────────────────────────────
    var selectedType by remember { mutableStateOf(BluetoothType.BLE) }

    Scaffold(
        topBar = { ScanTopBar() },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
        ) {
            Spacer(Modifier.height(8.dp))

            // Bluetooth disabled warning
            if (!viewModel.isBluetoothEnabled) {
                BluetoothDisabledBanner(
                    onEnable = {
                        enableBtLauncher.launch(Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE))
                    }
                )
                Spacer(Modifier.height(12.dp))
            }

            // Permission rationale
            if (!permissionsState.allPermissionsGranted) {
                PermissionRationaleBanner(
                    onRequest = { permissionsState.launchMultiplePermissionRequest() }
                )
                Spacer(Modifier.height(12.dp))
            }

            // Scan type toggle
            ScanTypeToggle(
                selected = selectedType,
                onSelect = { selectedType = it },
            )

            Spacer(Modifier.height(16.dp))

            // Scan button + counter
            ScanButton(
                isScanning = uiState.isScanning,
                deviceCount = uiState.discoveredDevices.size,
                enabled = permissionsState.allPermissionsGranted && viewModel.isBluetoothEnabled,
                onScan = {
                    if (uiState.isScanning) viewModel.stopScan()
                    else viewModel.startScan(selectedType)
                },
            )

            Spacer(Modifier.height(16.dp))

            // Error snackbar-style banner
            AnimatedVisibility(visible = uiState.error != null) {
                ErrorBanner(message = uiState.error ?: "", onDismiss = viewModel::clearError)
                Spacer(Modifier.height(8.dp))
            }

            // Device list
            DeviceList(
                devices = uiState.discoveredDevices,
                onDeviceClick = { device ->
                    if (permissionsState.allPermissionsGranted) {
                        viewModel.connectToDevice(device)
                        onDeviceSelected(device)
                    }
                },
            )
        }
    }
}

// ── Sub-components ────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ScanTopBar() {
    TopAppBar(
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Filled.Bluetooth,
                    contentDescription = null,
                    tint = BluetoothBlue,
                )
                Spacer(Modifier.width(8.dp))
                Text("Bluetooth Control", fontWeight = FontWeight.Bold)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
    )
}

@Composable
private fun BluetoothDisabledBanner(onEnable: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
        shape  = RoundedCornerShape(12.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Filled.BluetoothDisabled, contentDescription = null, tint = ErrorRed)
            Spacer(Modifier.width(8.dp))
            Text(
                "Bluetooth est désactivé",
                modifier = Modifier.weight(1f),
                style    = MaterialTheme.typography.bodyMedium,
            )
            TextButton(onClick = onEnable) { Text("Activer") }
        }
    }
}

@Composable
private fun PermissionRationaleBanner(onRequest: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape  = RoundedCornerShape(12.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Filled.Lock, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text(
                "Permissions Bluetooth requises",
                modifier = Modifier.weight(1f),
                style    = MaterialTheme.typography.bodyMedium,
            )
            TextButton(onClick = onRequest) { Text("Autoriser") }
        }
    }
}

@Composable
private fun ScanTypeToggle(selected: BluetoothType, onSelect: (BluetoothType) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant),
    ) {
        BluetoothType.values().forEach { type ->
            val isSelected = type == selected
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isSelected) BluetoothBlue else Color.Transparent)
                    .clickable { onSelect(type) }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text  = if (type == BluetoothType.BLE) "BLE (Low Energy)" else "Classic (SPP)",
                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                )
            }
        }
    }
}

@Composable
private fun ScanButton(
    isScanning: Boolean,
    deviceCount: Int,
    enabled: Boolean,
    onScan: () -> Unit,
) {
    val rotation by rememberInfiniteTransition(label = "scan-rotation").animateFloat(
        initialValue   = 0f,
        targetValue    = 360f,
        animationSpec  = infiniteRepeatable(tween(1200, easing = LinearEasing)),
        label          = "rotation",
    )

    Button(
        onClick  = onScan,
        enabled  = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape  = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isScanning) MaterialTheme.colorScheme.error else BluetoothBlue,
        ),
    ) {
        if (isScanning) {
            Icon(
                Icons.Filled.Refresh,
                contentDescription = null,
                modifier = Modifier
                    .size(20.dp)
                    .rotate(rotation),
            )
            Spacer(Modifier.width(8.dp))
            Text("Arrêter le scan  •  $deviceCount trouvé(s)", fontSize = 15.sp)
        } else {
            Icon(Icons.Filled.Search, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
            Text("Scanner les périphériques", fontSize = 15.sp)
        }
    }
}

@Composable
private fun ErrorBanner(message: String, onDismiss: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
        shape  = RoundedCornerShape(12.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Filled.Error, contentDescription = null, tint = ErrorRed)
            Spacer(Modifier.width(8.dp))
            Text(message, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
            IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                Icon(Icons.Filled.Close, contentDescription = "Fermer")
            }
        }
    }
}

@Composable
private fun DeviceList(
    devices: List<BluetoothDeviceModel>,
    onDeviceClick: (BluetoothDeviceModel) -> Unit,
) {
    if (devices.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 48.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Filled.BluetoothSearching,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint     = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    "Aucun périphérique trouvé",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                )
            }
        }
        return
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(devices, key = { it.address }) { device ->
            DeviceCard(device = device, onClick = { onDeviceClick(device) })
        }
    }
}

@Composable
private fun DeviceCard(device: BluetoothDeviceModel, onClick: () -> Unit) {
    val signalColor = when (SignalStrength.from(device.rssi)) {
        SignalStrength.EXCELLENT -> SignalGreen
        SignalStrength.GOOD      -> SignalGreen
        SignalStrength.FAIR      -> SignalYellow
        SignalStrength.WEAK      -> SignalRed
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Device type icon
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(BluetoothBlue.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (device.type == BluetoothType.BLE)
                        Icons.Filled.BluetoothConnected
                    else
                        Icons.Filled.Bluetooth,
                    contentDescription = null,
                    tint   = BluetoothBlue,
                    modifier = Modifier.size(24.dp),
                )
            }

            Spacer(Modifier.width(12.dp))

            // Name + address
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    device.name,
                    style      = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    device.address,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                )
                Text(
                    if (device.type == BluetoothType.BLE) "BLE" else "Classic",
                    style = MaterialTheme.typography.labelSmall,
                    color = BluetoothBlue,
                )
            }

            // RSSI badge
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Filled.SignalCellularAlt,
                    contentDescription = null,
                    tint   = signalColor,
                    modifier = Modifier.size(20.dp),
                )
                Text(
                    "${device.rssi} dBm",
                    style = MaterialTheme.typography.labelSmall,
                    color = signalColor,
                )
            }

            Spacer(Modifier.width(8.dp))
            Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface.copy(0.4f))
        }
    }
}
