package com.gastrosmart.bluetooth.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gastrosmart.bluetooth.model.BluetoothDeviceModel
import com.gastrosmart.bluetooth.model.BluetoothType
import com.gastrosmart.bluetooth.model.DeviceCommand
import com.gastrosmart.bluetooth.model.SignalStrength
import com.gastrosmart.bluetooth.ui.theme.*
import com.gastrosmart.bluetooth.viewmodel.BluetoothViewModel
import com.gastrosmart.bluetooth.viewmodel.UiConnectionState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceControlScreen(
    viewModel: BluetoothViewModel,
    onBack: () -> Unit,
) {
    val uiState by viewModel.uiState.collectAsState()
    val device  = uiState.selectedDevice

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            device?.name ?: "Périphérique",
                            fontWeight = FontWeight.Bold,
                            fontSize   = 18.sp,
                        )
                        Text(
                            device?.address ?: "",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(0.6f),
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.disconnect()
                        onBack()
                    }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Retour")
                    }
                },
                actions = {
                    ConnectionBadge(state = uiState.connectionState)
                    Spacer(Modifier.width(8.dp))
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Connection status card
            ConnectionStatusCard(
                state  = uiState.connectionState,
                device = device,
            )

            // Error card
            AnimatedVisibility(visible = uiState.error != null) {
                ErrorBanner(
                    message   = uiState.error ?: "",
                    onDismiss = viewModel::clearError,
                )
            }

            // Controls — only shown when connected
            AnimatedVisibility(
                visible = uiState.connectionState == UiConnectionState.CONNECTED,
                enter   = fadeIn() + expandVertically(),
                exit    = fadeOut() + shrinkVertically(),
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    // Power toggle card
                    PowerControlCard(
                        isOn    = uiState.devicePowerOn,
                        onTurnOn  = { viewModel.sendCommand(DeviceCommand.TurnOn) },
                        onTurnOff = { viewModel.sendCommand(DeviceCommand.TurnOff) },
                    )

                    // Slider card
                    SliderControlCard(
                        value   = uiState.sliderValue,
                        onValueChange = { v ->
                            viewModel.sendCommand(DeviceCommand.SetValue(v))
                        },
                    )

                    // Raw command card
                    RawCommandCard(
                        onSend = { bytes ->
                            viewModel.sendCommand(DeviceCommand.Raw(bytes))
                        },
                    )

                    // Disconnect button
                    OutlinedButton(
                        onClick  = {
                            viewModel.disconnect()
                            onBack()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape  = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(ErrorRed)
                        ),
                    ) {
                        Icon(Icons.Filled.BluetoothDisabled, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Déconnecter", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

// ── Sub-components ────────────────────────────────────────────────────────────

@Composable
private fun ConnectionBadge(state: UiConnectionState) {
    val (color, label) = when (state) {
        UiConnectionState.CONNECTED    -> SignalGreen to "Connecté"
        UiConnectionState.CONNECTING,
        UiConnectionState.DISCOVERING  -> SignalYellow to "Connexion…"
        UiConnectionState.ERROR        -> ErrorRed to "Erreur"
        UiConnectionState.DISCONNECTED -> MaterialTheme.colorScheme.onSurface.copy(0.4f) to "Déconnecté"
    }
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = 0.12f))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(Modifier.width(6.dp))
        Text(label, color = color, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
private fun ConnectionStatusCard(state: UiConnectionState, device: BluetoothDeviceModel?) {
    Card(
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth(),
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
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(BluetoothBlue.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (device?.type == BluetoothType.BLE)
                        Icons.Filled.BluetoothConnected
                    else
                        Icons.Filled.Bluetooth,
                    contentDescription = null,
                    tint = BluetoothBlue,
                    modifier = Modifier.size(28.dp),
                )
            }

            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    device?.name ?: "—",
                    style      = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                if (device != null) {
                    val signalText = "${device.rssi} dBm  •  ${SignalStrength.from(device.rssi).name}"
                    Text(
                        signalText,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(0.6f),
                    )
                }
                Text(
                    if (device?.type == BluetoothType.BLE) "Bluetooth Low Energy" else "Bluetooth Classic",
                    style = MaterialTheme.typography.labelSmall,
                    color = BluetoothBlue,
                )
            }

            if (state == UiConnectionState.CONNECTING || state == UiConnectionState.DISCOVERING) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    strokeWidth = 2.dp,
                    color = BluetoothBlue,
                )
            }
        }
    }
}

@Composable
private fun PowerControlCard(
    isOn: Boolean,
    onTurnOn: () -> Unit,
    onTurnOff: () -> Unit,
) {
    Card(
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                "Contrôle d'alimentation",
                style      = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(16.dp))

            // Big power indicator
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                        if (isOn) SignalGreen.copy(alpha = 0.12f)
                        else MaterialTheme.colorScheme.background
                    )
                    .padding(16.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Filled.PowerSettingsNew,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint     = if (isOn) SignalGreen else MaterialTheme.colorScheme.onSurface.copy(0.3f),
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        if (isOn) "ALLUMÉ" else "ÉTEINT",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 18.sp,
                        color      = if (isOn) SignalGreen else MaterialTheme.colorScheme.onSurface.copy(0.5f),
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Button(
                    onClick  = onTurnOn,
                    modifier = Modifier.weight(1f).height(48.dp),
                    enabled  = !isOn,
                    shape    = RoundedCornerShape(12.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = SignalGreen),
                ) {
                    Icon(Icons.Filled.PowerSettingsNew, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("ON", fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick  = onTurnOff,
                    modifier = Modifier.weight(1f).height(48.dp),
                    enabled  = isOn,
                    shape    = RoundedCornerShape(12.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = ErrorRed),
                ) {
                    Icon(Icons.Filled.PowerOff, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("OFF", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun SliderControlCard(value: Int, onValueChange: (Int) -> Unit) {
    var localValue by remember { mutableIntStateOf(value) }

    Card(
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Valeur / Intensité",
                    style      = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(BluetoothBlue.copy(alpha = 0.15f))
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                ) {
                    Text(
                        "$localValue %",
                        color      = BluetoothBlue,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 16.sp,
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            Slider(
                value         = localValue.toFloat(),
                onValueChange = { localValue = it.toInt() },
                onValueChangeFinished = { onValueChange(localValue) },
                valueRange    = 0f..100f,
                steps         = 0,
                colors        = SliderDefaults.colors(
                    thumbColor       = BluetoothBlue,
                    activeTrackColor = BluetoothBlue,
                ),
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("0 %",   style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                Text("50 %",  style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                Text("100 %", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }
        }
    }
}

@Composable
private fun RawCommandCard(onSend: (ByteArray) -> Unit) {
    var text by remember { mutableStateOf("") }

    Card(
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                "Commande brute (Hex)",
                style      = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(12.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                OutlinedTextField(
                    value         = text,
                    onValueChange = { text = it.uppercase().filter { c -> c.isLetterOrDigit() || c == ' ' } },
                    modifier      = Modifier.weight(1f),
                    placeholder   = { Text("Ex: 01 FF A0") },
                    singleLine    = true,
                    shape         = RoundedCornerShape(12.dp),
                    label         = { Text("Hex bytes séparés par espace") },
                )
                IconButton(
                    onClick  = {
                        val bytes = text.trim().split(" ").mapNotNull { hex ->
                            hex.toIntOrNull(16)?.toByte()
                        }.toByteArray()
                        if (bytes.isNotEmpty()) {
                            onSend(bytes)
                            text = ""
                        }
                    },
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(BluetoothBlue)
                        .size(52.dp),
                ) {
                    Icon(Icons.Filled.Send, contentDescription = "Envoyer", tint = Color.White)
                }
            }
        }
    }
}
