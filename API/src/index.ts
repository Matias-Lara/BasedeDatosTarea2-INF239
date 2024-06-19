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


app.post('/api/registrar', async ({body}) => {
    try{
        const {nombre, correo, clave} = await body as User;
        const newUser = await prisma.usuario.create({data: body as User});
        return{
            estado: 201,
            mensaje: `El correo se ha registrado correctamente`
        };
        
    } catch (err){
        console.log(`Error al intentar registrar el usuario: ${(err as Error).message}`);
        return {
        estado: 500,
        mensaje: 'Ha existido un error al realizar la peticion'
        };
    }
});

app.listen(3000, () => {
    console.log('🦊 Elysia is running on http://localhost:3000');
});


