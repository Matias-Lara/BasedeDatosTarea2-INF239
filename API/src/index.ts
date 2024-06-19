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


