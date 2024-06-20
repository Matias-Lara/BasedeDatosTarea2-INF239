import {Elysia} from "elysia";
import {PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();
const app = new Elysia();

interface User {
    id?:          number
    nombre:       string
    correo:       string   
    clave:        string
    descripcion?: string
}


app.get('/api/registrar', () => {
    return prisma.usuario.findMany()
})


// Registra los usuarios
app.post('/api/registrar', async ({body}) => {
    try{
        const {nombre, correo, clave} = await body as User;

        if (nombre && correo && clave){
            const registrado = await prisma.usuario.findUnique({where: {correo}})
           
            if (registrado){
                console.log(`El correo ${correo} ya se encuentra registrado`);
                return{
                    estado: 409,
                    mensaje: `El correo ya está registrado`
                };

            } else {
                const newUser = await prisma.usuario.create({data: body as User});
                return{
                    estado: 201,
                    mensaje: `El correo se ha registrado correctamente`
                }
            }

        } else {
            console.log('Credenciales incorrectas')
            return {
                estado: 400,
                mensaje: "Usuario y/o correo incorrectos"
                
            };
        }
    } catch (err){
        console.log(`Error al intentar registrar el usuario: ${(err as Error).message}`);
        return {
        estado: 500,
        mensaje: 'Ha existido un error al realizar la peticion'
        };
    }
});


// Obtiene la informacion de un usuario a traves de su correo 
app.get('/api/informacion/:correo', async ({params}) => {
    try {
        const {correo} = params;
        const usuario = await prisma.usuario.findUnique({
            where: {correo}, select: {nombre: true, correo: true, descripcion: true}});

        if (usuario) {
            console.log(`Se ha hecho una consulta de informacion al ${correo}`);
            return {
                estado: 200,
                usuario
            };

        } else {
            console.log(`Consulta fallida de información del correo ${correo}`);
            return {
                estado: 404,
                mensaje: 'Usuario no encontrado'
            };
        }

    } catch (err) {
        console.log(`Error al consultar información: ${(err as Error).message}`)
        return {
            estado: 500,
            mensaje: 'Ha existido un error al realizar la petición'
        };
    }
});

app.listen(3000, () => {
    console.log('🦊 Elysia is running on http://localhost:3000');
});
