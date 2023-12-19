from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto.Signature import pkcs1_15
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Util.Padding import pad
import os
import base64

auth_pub = "keys/public_key.pem"

# def unpad(s):
#     """Remove PKCS#7 padding"""
#     print(s[-1])
#     return s[:-(s[-1]+6)]

def decrypt_Rsa(message, key):
    encrypted_message = bytes(message, 'utf-8')
    print(encrypted_message)
    with open(key, 'rb') as f:
        private_key = RSA.import_key(f.read())

    # Create a cipher object using the private key
    cipher = PKCS1_OAEP.new(private_key)

    # Decrypt the message
    decrypted_message = cipher.decrypt(encrypted_message)

    return decrypted_message.decode('utf-8')

def hash_string_sha256_new(input_string):
    return SHA256.new(input_string.encode()).digest()

def decrypt_aes_new(encrypted_data, iv, key):
    key_bytes = base64.b64decode(key)
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(encrypted_data)
    print(decrypted)
    # Strip padding if necessary
    unpadded = unpad(decrypted)
    print(unpadded)
    return unpadded

def decrypt_aes(encrypted_data, iv, key):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_data = cipher.decrypt(encrypted_data)
    unpadded_data = decrypted_data[:-decrypted_data[-1]]
    decrypted_json = unpadded_data.decode('utf-8')
    return decrypted_json

def hash_string_sha256(input_string):
    sha256_hash = SHA256.new()
    sha256_hash.update(input_string.encode('utf-8'))
    hashed_string = sha256_hash.hexdigest()
    return hashed_string

def check_token(token):
    split_token = token.split('|')
    signed_hashed_token = base64.b64decode(split_token[-1])
    token_string = split_token[0:len(split_token)-1]
    hashed_token = SHA256.new(token_string.encode())
    try:
        with open(auth_pub, 'rb') as f:
            key = RSA.import_key(f.read())
        publickey = key.publickey().export_key()
        pkcs1_15.new(publickey).verify(hashed_token, signed_hashed_token)
        return True
    except (ValueError, TypeError):
        return False
    #decrypt this token using key
    #split the token with |
    #hash the first part
    #decrypt the second part and compare these hash values

def calculate_key(p, g, client_pub, s, username):
    server_pub = pow(g, s, p)
    key_val = pow(client_pub, s, p)
    key = hash_string_sha256(str(key_val))
    os.system("mkdir -p keys")
    os.system(f"echo '{key}' > keys/{username}_shared_key.pub")
    os.system(f"chmod 600 keys/{username}_shared_key.pub")
    return server_pub

def decrypt_rsa(encrypted_message, key):
    # encrypted_message = bytes(message, 'utf-8')
    encrypted_message = b'D\xcd\xdc\xc7e\xc8#=<\x1c\xc1\xeb\xbb\xc4\x84\x1f\x9f(\x94\x14DR\xd0w\x7fbk\xda\x83ikM\xad\xbe;\xd7XI\xe6\x9cr/\x05\xf4\xa8\x1aMX\xb9\x01R\x96\xda\xf7\xd3\x83\xb7N\xe8\x06\xech\x19\xfb\xfe\x8b=D\x82Q\xed\xfc\xe6\xc2Xn("e\xad`<\x7f\xa6\xb1g\xf7aP\x97\x83Tp\x19\xb5\xad^\x9e\x9bd\xb1\xad\xeeM+Z\',\x8e\x96i\xadJ\x8c3\x90\x1c\x1cU\x11\x17k\x19\x90aD\xed\xb7\x16\xe3\xac\xd6\x9fA5\x86\xcdC\x00\\\xedM\xf5u\xbd3<\xc1\x98WV\xe9\xa1\x92\xfc\xb77\x90\x1aR~N-\x04\x0f@x,\x11\x11\x06\xd3`O\n\x92\x9a\x8d\xcft\x00\xe7\xd9\x89/PZ\xaeGP\x96YSC\xb0$\x19\x9c\x8a\t\xb0\x94m\xdb\xfeD?\x00\x02jD\xa1\x04\x85P\xc9\xc9\x9e\xf7PE\x14!.\x9e\xc0\xc2\x93(\xca\xd9)\x07J\x85\x8f\xb7\xce=h\x9dw\xb0o\xd9\x90\xe2_\\\x9e\xde-\x1f>\xcb\x00qC\x94\xd3Tg\xf2\x10\x14\xddh\r\x16\x0e3s\x87Y\n+z\xb2\x12wU&\xa3\x01\xccA\xc3\xac\x1a%\x83\xa4\xc3\x10\xfe\xef\x7fdh\xbde\x8d\x88gF\xa4\x0b\xc5\xd8\xe7\xd3\xd9\x86e\xbfu\x1cV\x04|\x04Vn\xb5L\x85\xdb{\x92\xfea\xa4\xb65s\xac\xb0=E\xdau}\x0c\xbf\xb8^&\x16\xca\xe0h4,A\x1e1\xe0\xbf~t\xf6Oj\x0c\xfe\x7fA\xdc\xba\x1b\xeccQM\xc6X\xc8\xf1~\\4m\xc6\x1b\xe6wr\x0bB\xc8\x8e\xf1\xd2c\xee\xcc\xea\xf1p\xd6\x048\x12f\x86\x83eu\xe1\x02\x9b\xb7J@G`\x03(\x0b7"C\xd4\xb2\xa9e\xd1\xb1\xdd\xa2\x17\xf6\xf3\xe3\xab\x9e^*\x91\xa0 P\\\xd6\x1cg:\xdd\xfe\xd4\x82\x9e\x12o\x18\xf9\x06\xe8\xb6o\xa9#\x01\xc6\xda\xfed\xbe\xb4K\x8b9\x16\xd1\xba\xeb\x8f<(\x17\x83\x04\xd3\n\xadH\xed\xbcI/\xd8^\xc6\xed|\xe4kR\xb2\x15\x1bN\xa6B\xfa\xcd\x14\xaf\xe3KWI'
    print(encrypted_message)
    with open(key, 'rb') as f:
        private_key = RSA.import_key(f.read())

    # Create a cipher object using the private key
    cipher = PKCS1_OAEP.new(private_key)

    # Decrypt the message
    decrypted_message = cipher.decrypt(encrypted_message)

    return decrypted_message.decode('utf-8')

def update_key(shared_key, filename):
    os.system(f"echo '{shared_key}' > {filename}")