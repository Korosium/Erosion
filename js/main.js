//#region Constants
const AUTHOR_NAME = 'Korosium';

const MAGIC_NUMBER = 'EROSION';
const CIPHER_MAGIC_NUMBER = [3, 12];
const HASH_MAGIC_NUMBER = [3, 6, 12];
const ENCRYPTED_FILE_EXTENSION = '.ero';

const FILE_ENCRYPTION_LIMIT = 1024 * 1024 * 100; // ~ 100 MB
const FILE_DECRYPTION_LIMIT = 1024 * 1024 * 103; // ~ 103 MB for if the filename is obfuscated and for the nonce.

const PLAINTEXT_EMPTY_ERROR_MESSAGE = 'The plaintext is empty.';
const CIPHERTEXT_EMPTY_ERROR_MESSAGE = 'The ciphertext is empty.';
const KEY_EMPTY_ERROR_MESSAGE = 'The key is empty.';
const FILE_TO_ENCRYPT_ERROR_MESSAGE = 'Their is no file to encrypt.';
const FILE_TO_DECRYPT_ERROR_MESSAGE = 'Their is no file to decrypt.';
const FILE_TOO_BIG_ENCRYPT_ERROR_MESSAGE = 'The file is too big for encryption.';
const FILE_TOO_BIG_DECRYPT_ERROR_MESSAGE = 'The file is too big for decryption.';
const NO_COMBINATION_TEXT_DECRYPTION_ERROR_MESSAGE = 'No combination of settings was successful at decrypting the encrypted text.';
const NO_COMBINATION_FILE_DECRYPTION_ERROR_MESSAGE = 'No combination of settings was successful at decrypting the encrypted file.';
const NOT_RIGHT_KEY_ERROR_MESSAGE = 'Cannot decrypt the file because the wrong key was provided.';

const AVAILABLE_CIPHERS = ['ChaCha20-Poly1305', 'XChaCha20-Poly1305'];
const AVAILABLE_HASH = ['SHA-256', 'SHA-256d', 'SHA3-256'];
const AVAILABLE_ENCODING = ['Binary', 'Octal', 'Hex', 'Base32 (RFC-4648)', 'Base32 (Extended hex)', 'Base32 (z-base)', 'Base32 (Crockford)', 'Base64'];
//#endregion

//#region HTML Elements

// Text
const plaintext_text_textarea = document.getElementById('plaintext-text-textarea');
const plaintext_text_encrypt_button = document.getElementById('plaintext-text-encrypt-button');
const plaintext_text_copy_button = document.getElementById('plaintext-text-copy-button');
const plaintext_text_delete_button = document.getElementById('plaintext-text-delete-button');

const ciphertext_text_textarea = document.getElementById('ciphertext-text-textarea');
const ciphertext_text_decrypt_button = document.getElementById('ciphertext-text-decrypt-button');
const ciphertext_text_copy_button = document.getElementById('ciphertext-text-copy-button');
const ciphertext_text_delete_button = document.getElementById('ciphertext-text-delete-button');

const key_text_input = document.getElementById('key-text-input');
const key_text_show_button = document.getElementById('key-text-show-button');
const key_text_copy_button = document.getElementById('key-text-copy-button');
const key_text_delete_button = document.getElementById('key-text-delete-button');

// File
const plaintext_file_input = document.getElementById('plaintext-file-input');
const plaintext_file_encrypt_button = document.getElementById('plaintext-file-encrypt-button');
const plaintext_file_delete_button = document.getElementById('plaintext-file-delete-button');
const plaintext_file_results = document.getElementById('plaintext-file-results');
const plaintext_obfuscate_filename_check = document.getElementById('plaintext-obfuscate-filename-check');

const ciphertext_file_input = document.getElementById('ciphertext-file-input');
const ciphertext_file_decrypt_button = document.getElementById('ciphertext-file-decrypt-button');
const ciphertext_file_delete_button = document.getElementById('ciphertext-file-delete-button');
const ciphertext_file_results = document.getElementById('ciphertext-file-results');

const key_file_input = document.getElementById('key-file-input');
const key_file_show_button = document.getElementById('key-file-show-button');
const key_file_copy_button = document.getElementById('key-file-copy-button');
const key_file_delete_button = document.getElementById('key-file-delete-button');

// Settings
const settings_cipher_select = document.getElementById('settings-cipher-select');
const settings_hash_select = document.getElementById('settings-hash-select');
const settings_encoding_select = document.getElementById('settings-encoding-select');
const settings_lock_check = document.getElementById('settings-lock-check');
//#endregion

//#region Event Listeners

// Text
plaintext_text_encrypt_button.onclick = () => encrypt_text();
plaintext_text_copy_button.onclick = () => copy_text_to_clipboard(plaintext_text_textarea.value);
plaintext_text_delete_button.onclick = () => plaintext_text_textarea.value = '';

ciphertext_text_decrypt_button.onclick = () => decrypt_text();
ciphertext_text_copy_button.onclick = () => copy_text_to_clipboard(ciphertext_text_textarea.value);
ciphertext_text_delete_button.onclick = () => ciphertext_text_textarea.value = '';

key_text_show_button.onclick = () => show_text_password(key_text_input, key_text_show_button);
key_text_copy_button.onclick = () => copy_text_to_clipboard(key_text_input.value);
key_text_delete_button.onclick = () => key_text_input.value = '';

// File
plaintext_file_input.onchange = () => show_uploaded_plain_file();
plaintext_file_encrypt_button.onclick = () => encrypt_file();
plaintext_file_delete_button.onclick = () => delete_encrypt_file();

ciphertext_file_input.onchange = () => show_uploaded_cipher_file();
ciphertext_file_decrypt_button.onclick = () => decrypt_file();
ciphertext_file_delete_button.onclick = () => delete_decrypt_file();

key_file_show_button.onclick = () => show_text_password(key_file_input, key_file_show_button);
key_file_copy_button.onclick = () => copy_text_to_clipboard(key_file_input.value);
key_file_delete_button.onclick = () => key_file_input.value = '';

// Settings
settings_lock_check.onchange = () => toggle_settings();
//#endregion

//#region Functions

//#region Text

/**
 * Check the parameters for the text processes.
 * 
 * @param {HTMLInputElement} input         The input to check if a string is provided.
 * @param {string}           error_message The error message to show to the user if no string is provided.
 * 
 * @returns {boolean} True if everything is ok, false otherwise.
 */
const check_text_params = (input, error_message) => {
    try {
        if (input.value.length === 0) throw new Error(error_message);
        if (key_text_input.value.length === 0) throw new Error(KEY_EMPTY_ERROR_MESSAGE);
    } catch (error) {
        window.alert(error.message);
        return false;
    }
    return true;
};

/**
 * Encrypt the plain text with a key and show the cipher text on the page.
 */
const encrypt_text = () => {
    if (!check_text_params(plaintext_text_textarea, PLAINTEXT_EMPTY_ERROR_MESSAGE)) return;
    const key = get_key(key_text_input.value, settings_hash_select.value);
    const ciphertext = get_ciphertext(key, plaintext_text_textarea.value, settings_cipher_select.value);
    const encoded = encode_cipertext(ciphertext, settings_encoding_select.value);
    ciphertext_text_textarea.value = encoded;
};

/**
 * Decrypt the ciphertext with a key and show the plain text on the page.
 */
const decrypt_text = () => {
    if (!check_text_params(ciphertext_text_textarea, CIPHERTEXT_EMPTY_ERROR_MESSAGE)) return;
    try {
        decrypt_text_chosen_params();
    }
    catch {
        decrypt_text_bruteforce();
    }
};

/**
 * Decrypt the ciphertext with the current settings.
 */
const decrypt_text_chosen_params = () => {
    const key = get_key(key_text_input.value, settings_hash_select.value);
    const ciphertext = decode_ciphertext(ciphertext_text_textarea.value, settings_encoding_select.value);
    const plaintext = to_utf8(get_plaintext(key, ciphertext, settings_cipher_select.value));
    plaintext_text_textarea.value = plaintext;
};

/**
 * Decrypt the ciphertext with each iteration of the available settings.
 */
const decrypt_text_bruteforce = () => {
    const locked_settings = settings_lock_check.checked;
    for (let i = 0; i < AVAILABLE_CIPHERS.length; i++) {
        for (let j = 0; j < AVAILABLE_HASH.length; j++) {
            const key = get_key(key_text_input.value, AVAILABLE_HASH[j]);
            for (let k = 0; k < AVAILABLE_ENCODING.length; k++) {
                try {
                    const ciphertext = decode_ciphertext(ciphertext_text_textarea.value, AVAILABLE_ENCODING[k]);
                    const plaintext = to_utf8(get_plaintext(key, ciphertext, AVAILABLE_CIPHERS[i]));
                    plaintext_text_textarea.value = plaintext;
                    if (!locked_settings) {
                        settings_cipher_select.value = AVAILABLE_CIPHERS[i];
                        settings_hash_select.value = AVAILABLE_HASH[j];
                        settings_encoding_select.value = AVAILABLE_ENCODING[k];
                    }
                    return;
                }
                catch {
                    console.clear();
                    console.log('Retrying...');
                };
            }
        }
    }
    window.alert(NO_COMBINATION_TEXT_DECRYPTION_ERROR_MESSAGE);
};

/**
 * Encode the byte array ciphertext with the chosen encoding scheme.
 * 
 * @param {number[]} ciphertext The byte array ciphertext.
 * @param {string}   algorithm  The chosen encoding scheme.
 * 
 * @returns {string} The encoded ciphertext.
 */
const encode_cipertext = (ciphertext, algorithm) => {
    switch (algorithm) {
        case AVAILABLE_ENCODING[0]: return ciphertext.map(x => x.toString(2).padStart(8, '0')).join('');
        case AVAILABLE_ENCODING[1]: return ciphertext.map(x => x.toString(8).padStart(3, '0')).join('');
        case AVAILABLE_ENCODING[2]: return ciphertext.map(x => x.toString(16).padStart(2, '0')).join('');
        case AVAILABLE_ENCODING[3]: return base32.RFC_4648.encode(ciphertext);
        case AVAILABLE_ENCODING[4]: return base32.BASE_32_HEX.encode(ciphertext);
        case AVAILABLE_ENCODING[5]: return base32.Z_BASE_32.encode(ciphertext);
        case AVAILABLE_ENCODING[6]: return base32.CROCKFORD_BASE_32.encode(ciphertext);
        case AVAILABLE_ENCODING[7]: return btoa(ciphertext.map(x => String.fromCharCode(x)).join(''));
    }
};

/**
 * Decode the ciphertext with the chosen encoding scheme.
 * 
 * @param {string} ciphertext The ciphertext to decode.
 * @param {string} algorithm  The chosen encoding scheme.
 * 
 * @returns {number[]} The decoded ciphertext.
 */
const decode_ciphertext = (ciphertext, algorithm) => {
    switch (algorithm) {
        case AVAILABLE_ENCODING[0]: return from_bin(ciphertext);
        case AVAILABLE_ENCODING[1]: return from_oct(ciphertext);
        case AVAILABLE_ENCODING[2]: return from_hex(ciphertext);
        case AVAILABLE_ENCODING[3]: return base32.RFC_4648.decode.to_array(ciphertext);
        case AVAILABLE_ENCODING[4]: return base32.BASE_32_HEX.decode.to_array(ciphertext);
        case AVAILABLE_ENCODING[5]: return base32.Z_BASE_32.decode.to_array(ciphertext);
        case AVAILABLE_ENCODING[6]: return base32.CROCKFORD_BASE_32.decode.to_array(ciphertext);
        case AVAILABLE_ENCODING[7]: return atob(ciphertext).split('').map(x => x.charCodeAt());
    }
};

/**
 * Convert a string to a byte array.
 * 
 * @param {string} s       The string to convert.
 * @param {number} radix   The radix of the string.
 * @param {number} padding The number of char used for one encrypted character.
 * 
 * @returns {number[]} The byte array.
 */
const from_radix = (s, radix, padding) => {
    let arr = [];
    for (let i = 0; i < s.length; i += padding) {
        arr.push(parseInt(s.slice(i, i + padding), radix));
    }
    return arr;
};

/**
 * Convert a binary string to a byte array.
 * 
 * @param {string} s The binary string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_bin = s => from_radix(s, 2, 8);

/**
 * Convert a octal string to a byte array.
 * 
 * @param {string} s The octal string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_oct = s => from_radix(s, 8, 3);

/**
 * Convert a hexadecimal string to a byte array.
 * 
 * @param {string} s The hexadecimal string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_hex = s => from_radix(s, 16, 2);
//#endregion

//#region File
let clear_plaintext_file_results_timeout = setTimeout(() => { plaintext_file_results.innerHTML = ''; }, 0);
let clear_ciphertext_file_results_timeout = setTimeout(() => { ciphertext_file_results.innerHTML = ''; }, 0);

/**
 * Check the parameters for the file processes.
 * 
 * @param {HTMLInputElement} input         The input to check if a file is provided.
 * @param {string}           error_message The error message to show to the user if no file is provided.
 * 
 * @returns {boolean} True if everything is ok, false otherwise.
 */
const check_file_params = (input, error_message) => {
    try {
        if (input.files.length === 0) throw new Error(error_message);
        if (key_file_input.value.length === 0) throw new Error(KEY_EMPTY_ERROR_MESSAGE);
    } catch (error) {
        window.alert(error.message);
        return false;
    }
    return true;
};

/**
 * Encrypt a plain file with a key and download the cipher file afterward.
 */
const encrypt_file = () => {
    if (!check_file_params(plaintext_file_input, FILE_TO_ENCRYPT_ERROR_MESSAGE)) return;
    const file = plaintext_file_input.files[0];
    const fr = new FileReader();
    fr.onload = () => {
        const timestamp = performance.now();
        const key = get_key(key_file_input.value, settings_hash_select.value);
        const data = [].slice.call(new Uint8Array(fr.result));
        const filename = file.name;
        const obfuscate = plaintext_obfuscate_filename_check.checked;
        const plaintext = obfuscate ? [to_byte(filename).slice(0, 255).length].concat(to_byte(filename).slice(0, 255)).concat(data) : [0].concat(data);
        const ciphertext = get_magic_number(settings_cipher_select.value, settings_hash_select.value).concat(get_ciphertext(key, plaintext, settings_cipher_select.value));
        download_bytes(ciphertext, obfuscate ? `${get_timestamp()}${ENCRYPTED_FILE_EXTENSION}` : `${filename}${ENCRYPTED_FILE_EXTENSION}`);
        deal_with_end_of_file_encryption(timestamp);
    };
    fr.onerror = () => {
        console.log(fr.error);
    };
    fr.readAsArrayBuffer(file);
};

/**
 * Decrypt a cipher file with a key and download the plain file afterward.
 */
const decrypt_file = () => {
    if (!check_file_params(ciphertext_file_input, FILE_TO_DECRYPT_ERROR_MESSAGE)) return;
    const file = ciphertext_file_input.files[0];
    const fr = new FileReader();
    fr.onload = () => {
        const data = [].slice.call(new Uint8Array(fr.result));
        if (to_utf8(data.slice(0, MAGIC_NUMBER.length)) === MAGIC_NUMBER) {
            try {
                decrypt_file_with_magic_number(data, file.name);
            }
            catch {
                window.alert(NOT_RIGHT_KEY_ERROR_MESSAGE);
            }
        }
        else {
            try {
                decrypt_file_without_magic_number(data, file.name);
            }
            catch {
                decrypt_file_bruteforce(data, file.name);
            }
        }
    };
    fr.onerror = () => {
        console.log(fr.error);
    };
    fr.readAsArrayBuffer(file);
};

/**
 * Decrypt a file that has a magic number at the start.
 * 
 * @param {number[]} data     The ciphertext data to decrypt.
 * @param {string}   filename The ciphertext filename.
 */
const decrypt_file_with_magic_number = (data, filename) => {
    const timestamp = performance.now();
    const cipher_algorithm = AVAILABLE_CIPHERS[CIPHER_MAGIC_NUMBER.indexOf((data[MAGIC_NUMBER.length] >>> 4) & 0xf)];
    const hash_algorithm = AVAILABLE_HASH[HASH_MAGIC_NUMBER.indexOf(data[MAGIC_NUMBER.length] & 0xf)];
    const key = get_key(key_file_input.value, hash_algorithm);
    const plaintext = get_plaintext(key, data.slice(MAGIC_NUMBER.length + 1), cipher_algorithm);
    const obfuscate = plaintext[0] > 0;
    const retrieved_filename = obfuscate ? to_utf8(plaintext.slice(1, plaintext[0] + 1)) : filename.slice(0, filename.length - ENCRYPTED_FILE_EXTENSION.length);
    download_bytes(obfuscate ? plaintext.slice(plaintext[0] + 1) : plaintext.slice(1), retrieved_filename);
    deal_with_end_of_file_decryption(timestamp);
};

/**
 * Decrypt a file that do not have a magic number at the start.
 * 
 * @param {number[]} data The ciphertext data to decrypt.
 * @param {string}   filename The ciphertext filename.
 */
const decrypt_file_without_magic_number = (data, filename) => {
    const timestamp = performance.now();
    const key = get_key(key_file_input.value, settings_hash_select.value);
    const plaintext = get_plaintext(key, data, settings_cipher_select.value);
    const obfuscate = plaintext[0] > 0;
    const retrieved_filename = obfuscate ? to_utf8(plaintext.slice(1, plaintext[0] + 1)) : filename.slice(0, filename.length - ENCRYPTED_FILE_EXTENSION.length);
    download_bytes(obfuscate ? plaintext.slice(plaintext[0] + 1) : plaintext.slice(1), retrieved_filename);
    deal_with_end_of_file_decryption(timestamp);
};

/**
 * Decrypt a file until the settings are right, or not.
 * 
 * @param {number[]} data The ciphertext data to decrypt.
 * @param {string}   filename The ciphertext filename.
 */
const decrypt_file_bruteforce = (data, filename) => {
    const timestamp = performance.now();
    const locked_settings = settings_lock_check.checked;
    for (let i = 0; i < AVAILABLE_CIPHERS.length; i++) {
        for (let j = 0; j < AVAILABLE_HASH.length; j++) {
            try {
                const key = get_key(key_file_input.value, AVAILABLE_HASH[j]);
                const plaintext = get_plaintext(key, data, AVAILABLE_CIPHERS[i]);
                const obfuscate = plaintext[0] > 0;
                const retrieved_filename = obfuscate ? to_utf8(plaintext.slice(1, plaintext[0] + 1)) : filename.slice(0, filename.length - ENCRYPTED_FILE_EXTENSION.length);
                download_bytes(obfuscate ? plaintext.slice(plaintext[0] + 1) : plaintext.slice(1), retrieved_filename);
                deal_with_end_of_file_decryption(timestamp);
                if (!locked_settings) {
                    settings_cipher_select.value = AVAILABLE_CIPHERS[i];
                    settings_hash_select.value = AVAILABLE_HASH[j];
                }
                return;
            }
            catch {
                console.clear();
                console.log('Retrying...');
            }
        }
    }
    window.alert(NO_COMBINATION_FILE_DECRYPTION_ERROR_MESSAGE);
};

/**
 * Deal with the last couple steps for the encryption process.
 * 
 * @param {number} timestamp When the encryption started.
 */
const deal_with_end_of_file_encryption = timestamp => {
    plaintext_file_input.value = '';
    plaintext_file_results.innerHTML = show_elapsed_time(performance.now() - timestamp, 'encrypt');
    clear_plaintext_file_results_timeout = setTimeout(function () { plaintext_file_results.innerHTML = ''; }, 5000);
};

/**
 * Deal with the last couple steps for the decryption process.
 * 
 * @param {number} timestamp When the decryption started.
 */
const deal_with_end_of_file_decryption = timestamp => {
    ciphertext_file_input.value = '';
    ciphertext_file_results.innerHTML = show_elapsed_time(performance.now() - timestamp, 'decrypt');
    clear_ciphertext_file_results_timeout = setTimeout(() => { ciphertext_file_results.innerHTML = ''; }, 5000);
};

/**
 * Generate the magic number for this file.
 * 
 * @param {string} cipher_algorithm The chosen cipher algorithm.
 * @param {string} hash_algorithm   The chosen hash algorithm.
 * 
 * @returns {number[]} The magic number for this file.
 */
const get_magic_number = (cipher_algorithm, hash_algorithm) => {
    let file_magic_number = [].slice.call(new TextEncoder().encode(MAGIC_NUMBER));
    const cipher_bits = CIPHER_MAGIC_NUMBER[AVAILABLE_CIPHERS.indexOf(cipher_algorithm)] << 4;
    const hash_bits = HASH_MAGIC_NUMBER[AVAILABLE_HASH.indexOf(hash_algorithm)];
    file_magic_number.push(cipher_bits | hash_bits);
    return file_magic_number;
};

/**
 * Get the current ISO timestamp.
 * 
 * @returns {string} The current ISO timestamp.
 */
const get_timestamp = () => {
    const timestamp = new Date().toISOString().replaceAll('-', '').replaceAll('T', '').replaceAll(':', '');
    return timestamp.slice(0, timestamp.indexOf('.'));
};

/**
 * Show the file size and check if the file can be encrypted.
 */
const show_uploaded_plain_file = () => {
    clearTimeout(clear_plaintext_file_results_timeout);
    plaintext_file_results.innerHTML = show_file_size(plaintext_file_input.files[0].size);
    if (plaintext_file_input.files[0].size > FILE_ENCRYPTION_LIMIT) {
        window.alert(FILE_TOO_BIG_ENCRYPT_ERROR_MESSAGE);
        plaintext_file_delete_button.click();
    }
};

/**
 * Show the file size and check if the file can be decrypted.
 */
const show_uploaded_cipher_file = () => {
    clearTimeout(clear_ciphertext_file_results_timeout);
    ciphertext_file_results.innerHTML = show_file_size(ciphertext_file_input.files[0].size);
    if (ciphertext_file_input.files[0].size > FILE_DECRYPTION_LIMIT) {
        window.alert(FILE_TOO_BIG_DECRYPT_ERROR_MESSAGE);
        ciphertext_file_delete_button.click();
    }
};

/**
 * Delete all fields for the file encryption.
 */
const delete_encrypt_file = () => {
    plaintext_file_input.value = '';
    plaintext_file_results.innerHTML = '';
};

/**
 * Delete all fields for the file decryption.
 */
const delete_decrypt_file = () => {
    ciphertext_file_input.value = '';
    ciphertext_file_results.innerHTML = '';
};

/**
 * Show the size of a file.
 * 
 * @param {number} size The amount of bytes the file weigh.
 * 
 * @returns {string} The formated size of the file.
 */
const show_file_size = size => {
    if (size <= 1) return `${size} byte`;
    if (size < 1024) return `${size} bytes`;
    if (size / 1024 < 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size / 1024 / 1024 < 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Show the time it took for a process to complete.
 * 
 * @param {number} took      The amount of milliseconds it took for the process to complete.
 * @param {string} operation The name of the operation.
 * 
 * @returns {string} The formated time it took.
 */
const show_elapsed_time = (took, operation) => {
    if (took < 1000) return `It took ${took} ms to ${operation} the file.`;
    if (took / 1000 < 1000) return `It took ${(took / 1000).toFixed(2)} seconds to ${operation} the file.`;
    if (took / 1000 / 1000 < 1000) return `It took ${(took / 1000 / 1000).toFixed(2)} minutes to ${operation} the file.`;
};

/**
 * Download a byte array as a file.
 * 
 * @param {number[]} bytes The bytes to download.
 * @param {string}   name  The name of the generated file.
 */
const download_bytes = (bytes, name) => {
    let a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    a = null;
};
//#endregion

//#region Both

/**
 * Convert a string to a byte array.
 * 
 * @param {string} s The string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const to_byte = s => [].slice.call(new TextEncoder().encode(s));

/**
 * Convert a byte array to a string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The string.
 */
const to_utf8 = arr => new TextDecoder().decode(new Uint8Array(arr).buffer);

/**
 * Get the byte array checksum of the key based on the chosen hash algorithm.
 * 
 * @param {string} key       The key to hash.
 * @param {string} algorithm The chosen hash algorithm.
 * 
 * @returns {number[]} The byte array checksum.
 */
const get_key = (key, algorithm) => {
    switch (algorithm) {
        case AVAILABLE_HASH[0]: return sha256.hash.array(key);
        case AVAILABLE_HASH[1]: return sha256.hash.array(sha256.hash.array(key));
        case AVAILABLE_HASH[2]: return sha3_256.hash.array(key);
    }
};

/**
 * Get the byte array ciphertext of the plaintext based on the chosen cipher algorithm.
 * 
 * @param {number[]}          key       The byte array checksum key.
 * @param {string | number[]} plaintext The text or file data to encrypt.
 * @param {string}            algorithm The chosen cipher algorithm.
 * 
 * @returns {number[]} The byte array ciphertext.
 */
const get_ciphertext = (key, plaintext, algorithm) => {
    switch (algorithm) {
        case AVAILABLE_CIPHERS[0]: return chacha20_poly1305.encrypt.array(key, plaintext);
        case AVAILABLE_CIPHERS[1]: return xchacha20_poly1305.encrypt.array(key, plaintext);
    }
};

/**
 * Get the byte array plaintext of the ciphertext based on the chosen cipher algorithm.
 * 
 * @param {number[]} key        The byte array checksum key.
 * @param {number[]} ciphertext The byte array ciphertext.
 * @param {string}   algorithm  The chosen cipher algorithm.
 * 
 * @returns {number[]} The byte array plaintext.
 */
const get_plaintext = (key, ciphertext, algorithm) => {
    switch (algorithm) {
        case AVAILABLE_CIPHERS[0]: return chacha20_poly1305.decrypt.array.to_array(key, ciphertext);
        case AVAILABLE_CIPHERS[1]: return xchacha20_poly1305.decrypt.array.to_array(key, ciphertext);
    }
};

/**
 * Change the password attribute from 'password' to 'text' and vice versa.
 * 
 * @param {HTMLInputElement}  password_input The password input to change the attribute.
 * @param {HTMLButtonElement} show_button    The button to change the text.
 */
const show_text_password = (password_input, show_button) => {
    if (password_input.type === 'password') {
        password_input.type = 'text';
        show_button.innerHTML = 'Hide';
    }
    else {
        password_input.type = 'password';
        show_button.innerHTML = 'Show';
    }
};

/**
 * Toggle the settings based on the user's choice.
 */
const toggle_settings = () => {
    settings_cipher_select.disabled = settings_lock_check.checked;
    settings_hash_select.disabled = settings_lock_check.checked;
    settings_encoding_select.disabled = settings_lock_check.checked;
};

/**
 * Copy the text to the clipboard.
 * 
 * @param {string} s The text to copy to the clipboard.
 */
const copy_text_to_clipboard = s => navigator.clipboard.writeText(s);

/**
 * Populate a HTML select element with an array.
 * 
 * @param {HTMLSelectElement}   select The select element to populate.
 * @param {string[] | number[]} array  The array used to populate the select.
 */
const fill_select = (select, array) => {
    for (let i = 0; i < array.length; i++) {
        const option = document.createElement('option');
        option.value = array[i];
        option.innerHTML = array[i];
        select.append(option);
    }
};
//#endregion

//#endregion

//#region On Load

/**
 * Initialize the elements on the page before doing anything with them.
 */
const init = () => {
    // Both
    fill_select(settings_cipher_select, AVAILABLE_CIPHERS);
    fill_select(settings_hash_select, AVAILABLE_HASH);
    fill_select(settings_encoding_select, AVAILABLE_ENCODING);

    // Text
    plaintext_text_delete_button.click();
    ciphertext_text_delete_button.click();
    key_text_delete_button.click();

    // File
    plaintext_file_delete_button.click();
    ciphertext_file_delete_button.click();
    key_file_delete_button.click();

    // Options
    plaintext_obfuscate_filename_check.checked = true;
    ciphertext_file_input.accept = ENCRYPTED_FILE_EXTENSION;

    // Settings
    settings_cipher_select.value = AVAILABLE_CIPHERS[1];
    settings_hash_select.value = AVAILABLE_HASH[2];
    settings_encoding_select.value = AVAILABLE_ENCODING[7];
    settings_lock_check.checked = true;
    toggle_settings();

    // Footer
    document.getElementsByTagName('footer')[0].innerHTML += `<p>Copyright © ${new Date().getFullYear()} ${AUTHOR_NAME}</p>`;
};

/**
 * Run this function after the page has loaded.
 */
const main = () => {
    init();
};

window.onload = main;
//#endregion
