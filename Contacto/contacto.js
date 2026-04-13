import { hashPassword, encryptData} from './crytoTools.js';

//////////Aqui donde empiezan las acciones y esas varas, suerte entendiendo//////////
    // ---- EJEMPLO 3: FORMULARIO CON ENCRIPTACIÓN ----
    const demoForm = document.getElementById('demoForm');
    
    if (demoForm) {
        demoForm.addEventListener('submit', async (event) => {
            // Prevenir el envío normal del formulario
            event.preventDefault();
            
            console.log('Formulario enviado - Procesando datos...');
            
            // Obtener los valores del formulario
            const nombre = document.getElementById('Nombre').value;
            const contrasena = document.getElementById('Contrasena').value;
            const mensaje = document.getElementById('Mensaje').value;
            const formResult = document.getElementById('formResult');
            
            // Validar que los campos no estén vacíos
            if (!nombre || !contrasena || !mensaje) {
                formResult.innerHTML = `
                    <span class="error">❌ Por favor, completa todos los campos del formulario</span>
                `;
                return;
            }
            
            try {
                // Mostrar estado de procesamiento
                formResult.innerHTML = `
                    <span class="info">⏳ Procesando y protegiendo datos...</span>
                `;
                
                // PASO 1: Generar hash de la contraseña (no se guarda el texto plano)
                console.log('📝 Generando hash de la contraseña...');
                const hashedPassword = await hashPassword(contrasena);
                
                // PASO 2: Encriptar el nombre de usuario (simulando datos sensibles)
                console.log('🔒 Encriptando nombre de usuario...');
                const masterKey = "claveMaestraDelSistema"; // En un caso real, esto sería única por usuario
                const encryptedUsername = await encryptData(nombre, masterKey);

                console.log('🔒 Encriptando nombre de Mensaje...');
                const masterKey2 = "claveMaestraDelSistema2"; // En un caso real, esto sería única por usuario
                const encryptedMensaje = await encryptData(mensaje, masterKey2);
                
                // PASO 3: Simular envío al servidor (aquí normalmente harías un fetch)
                const datosProtegidos = {
                    username_encriptado: encryptedUsername,
                    mensaje_encriptado: encryptedMensaje,
                    password_hash: hashedPassword,
                    timestamp: new Date().toISOString(),
                    metodo: "POST",
                    endpoint: "/api/registro"
                };
                
                console.log('📦 Datos que se enviarían al servidor:', datosProtegidos);
                
                // Mostrar resultados en el HTML
                formResult.innerHTML = `
                    <strong>¡Datos protegidos exitosamente!</strong><br><br>
                    
                    <strong> Este es el siguente Hash de su contraseña:</strong><br>
                    <div style="font-size: 11px; background: white; padding: 8px; border-radius: 4px; margin-top: 5px; word-break: break-all;">
                        ${hashedPassword}
                    </div>
                    
                    <br>
                    
                    <strong> Nombre de usuario encriptado:</strong><br>
                    <div style="font-size: 11px; background: white; padding: 8px; border-radius: 4px; margin-top: 5px; word-break: break-all;">
                        ${encryptedUsername}
                    </div>
                    
                    <br>

                    <strong> El mensaje encriptado:</strong><br>
                    <div style="font-size: 11px; background: white; padding: 8px; border-radius: 4px; margin-top: 5px; word-break: break-all;">
                        ${encryptedMensaje}
                    </div>
                    
                    <br>
                    
                    <strong> Mensaje de envío al servidor:</strong><br>
                    <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 5px;">
                        <code style="word-break: break-all;">
                            ${JSON.stringify(datosProtegidos, null, 2)}
                        </code>
                    </div>
                    
                `;
                
                // Limpiar los campos del formulario (opcional)
                // document.getElementById('username').value = '';
                // document.getElementById('formPassword').value = '';
                
            } catch (error) {
                console.error('❌ Error en el procesamiento del formulario:', error);
                formResult.innerHTML = `
                    <span class="error">❌ Error al procesar el formulario: ${error.message}</span>
                `;
            }
        });
    } else {
        console.warn('⚠️ No se encontró el formulario con id "demoForm"');
    }
    
    // Mostrar mensaje de inicio
    console.log('🚀 Utilidades de encriptación cargadas correctamente');
    console.log('💡 Prueba el formulario: completa los campos y haz clic en enviar');
    
    // Verificar si hay datos guardados previamente
    const savedNote = localStorage.getItem('encryptedNote');
    if (savedNote && document.getElementById('encryptedResult')) {
        document.getElementById('encryptedResult').innerHTML = `
            <strong>💾 Dato recuperado del localStorage:</strong><br>
            <div style="font-size: 12px; word-break: break-all;">${savedNote}</div>
            <br>
            <small>Usa la contraseña maestra original para desencriptar</small>
        `;
        lastEncryptedPackage = savedNote;
        console.log('💾 Dato recuperado de localStorage al cargar');
    }

window.irAPagina = function(url) {
    if (url) {
        window.location.href = url;
    }
}
