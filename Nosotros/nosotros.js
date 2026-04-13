function abrirModal() {
    document.getElementById("miModal").classList.add("activo");
}

function cerrarModal() {
    document.getElementById("miModal").classList.remove("activo");
}

// Cerrar si el usuario hace click fuera del modal
window.onclick = function(e) {
    const modal = document.getElementById("miModal");
    if (e.target === modal) {
        cerrarModal();
    }
}

function irAPagina(url) {
    if (url) {
        window.location.href = url;
    }
}

/////// Esta parte es toda la freaking encriptacion de contacto, ehhh es hash btw////////////////

/**
 * Convierte un ArrayBuffer a una cadena Base64 (para guardar en JSON, input, localStorage)
 */
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Convierte Base64 a ArrayBuffer (para desencriptar)
 */
const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * 1. HASH (Unidireccional)
 * Ideal para contraseñas antes de enviarlas o compararlas.
 */
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
};

/**
 * Genera una clave segura a partir de una contraseña maestra usando PBKDF2
 */
const getKeyFromPassword = async (password, salt) => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encripta un texto plano
 * @param {string} plainText - El texto a encriptar
 * @param {string} masterPassword - La contraseña maestra
 * @returns {Promise<string>} - Objeto en Base64 que contiene: iv.ciphertext
 */
const encryptData = async (plainText, masterPassword) => {
    try {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        const key = await getKeyFromPassword(masterPassword, salt);
        
        const encodedText = encoder.encode(plainText);
        
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encodedText
        );
        
        const saltBase64 = arrayBufferToBase64(salt);
        const ivBase64 = arrayBufferToBase64(iv);
        const ciphertextBase64 = arrayBufferToBase64(encryptedContent);
        
        return `${saltBase64}.${ivBase64}.${ciphertextBase64}`;
    } catch (error) {
        console.error('Error en encriptación:', error);
        throw new Error('No se pudo encriptar el dato');
    }
};

/**
 * Desencripta un texto previamente encriptado con encryptData
 * @param {string} encryptedPackage - El string combinado (salt.iv.ciphertext)
 * @param {string} masterPassword - La misma contraseña maestra usada para encriptar
 * @returns {Promise<string>} - El texto original
 */
const decryptData = async (encryptedPackage, masterPassword) => {
    try {
        const [saltBase64, ivBase64, ciphertextBase64] = encryptedPackage.split('.');
        
        const salt = base64ToArrayBuffer(saltBase64);
        const iv = base64ToArrayBuffer(ivBase64);
        const ciphertext = base64ToArrayBuffer(ciphertextBase64);
        
        const key = await getKeyFromPassword(masterPassword, new Uint8Array(salt));
        
        const decryptedContent = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedContent);
    } catch (error) {
        console.error('Error en desencriptación:', error);
        throw new Error('Contraseña incorrecta o datos corruptos');
    }
};

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

