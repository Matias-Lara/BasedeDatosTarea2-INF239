import requests

# Se puede configurar a la direccion a la que quieran
API_URL = 'http://localhost:3000/api'


# funcion que permite verificar si el correo existe en la base de datos
def login():
    correo = input("Ingrese su correo: ")
    clave = input("Ingrese su clave: ")

    payload = {
        'correo': correo,
        'clave': clave
    }

    response = requests.post(f'{API_URL}/login', json=payload) 

    datos = response.json()
    if datos['estado'] == 200:
        print("Bienvenido")
        return correo, clave
    else:
        print('Correo o clave incorrecta')
        return None, None
 

# obtiene la informacion del correo ingresado
def informacion():
    correoinfo = input("Ingrese el correo del usuario: ")
    response = requests.get(f'{API_URL}/informacion/{correoinfo}')
    print(response.json())


# marca un correo como favorito.
def marcar(correo, clave):
    id_correo_favorito = input("Ingrese el ID del correo: ")
    id_correo_favorito = int(id_correo_favorito)

    payload = {
        'correo': correo,
        'clave': clave,
        'id_correo_favorito': id_correo_favorito
    }
    
    response = requests.post(f'{API_URL}/marcarcorreo', json = payload)
    print(response.json())


# muestra los correos favoritos de los usuarios
def correosfavoritos(correo, clave):
    payload = {
        'correo': correo,
        'clave': clave
    }
    response = requests.post(f'{API_URL}/verfavoritos', json = payload)
    print(response.json())


def main():
    correo, clave = login()
    if (correo is None):
        return

    while True:
        print("\nMenu de opciones:")
        print("2. Ver la información de una dirección de correo")
        print("3. Ver correos marcados como favoritos")
        print("4. Marcar correo como favorito")
        print("5. Cerrar Menu")

        opcion = input("Ingrese la opcion deseada: ")
        print()

        if opcion == '2':
            informacion()
        elif opcion == '3':
            correosfavoritos(correo, clave)
        elif opcion == '4':
            marcar(correo, clave)
        elif opcion == '5':
            print("Se ha cerrado la sesion correctamente")
            break
        else:
            print("Esta opcion no es valida")

if __name__ == '__main__':
    main()
