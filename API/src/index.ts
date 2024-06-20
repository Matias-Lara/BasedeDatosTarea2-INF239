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

interface Bloquear{
    correo:         string   
    clave:          string
    correo_bloquear:string
}

interface Marcar{
    correo:         string   
    clave:          string
    id_correo_favorito: number
}

interface Desmarcar{
    correo:         string   
    clave:          string
    id_correo_favorito: number
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

// Bloquea los usuarios
app.post('/api/bloquear', async ({body}) => {
    try {
        const {correo, clave, correo_bloquear} = body as Bloquear;
        const personaje = await prisma.usuario.findUnique({ where: {correo}});

        if (personaje && clave && personaje.clave === clave) {
            const bloqueillo = await prisma.bloqueado.findFirst({
                where: { correoBloqueado: correo_bloquear }});

            if (bloqueillo) {
                console.log(`El correo ${correo_bloquear} ya está bloqueado`);
                return {
                    estado: 409,
                    mensaje: 'El correo ya ha sido bloqueado por un administrador'
                }; 

            } else {
                await prisma.bloqueado.create({
                    data: {
                        usuarioId: personaje.id,
                        correoBloqueado: correo_bloquear
                    }
                });
    
                console.log(`Usuario ${correo_bloquear} bloqueado por ${correo}`);
                return {
                    estado: 201,
                    mensaje: 'Usuario bloqueado con éxito'
                };
            }

        } else {
            console.log(`Credenciales incorrectas`);
            return {
                estado: 401,
                mensaje: 'Usuario y/o correo a bloquear incorrectos'
            };
        }

    } catch (err) {
        console.log(`Error al intentar bloquear usuario: ${(err as Error).message}`);
        return {
            estado: 500,
            mensaje: 'Ha existido un error al intentra bloquear el correo'
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


// Marcar un correo como favorito
app.post('/api/marcarcorreo', async ({ body }) => {
    try {
        const {correo, clave, id_correo_favorito} = body as Marcar;
        const usuario = await prisma.usuario.findUnique({ where: {correo} });

        if (usuario && id_correo_favorito && usuario.clave === clave) {

            const correillo = await prisma.correo.findUnique({
                where: {id: id_correo_favorito}});

            if (!correillo) {
                console.log('No se ha encontrado el correo');
                return {
                    estado: 404,
                    mensaje: 'No se ha encontrado el correo'
                };
            }
            
            if (correillo.remitenteId === usuario.id || correillo.destinatarioId === usuario.id){
                await prisma.favorito.create({
                    data: {
                        usuarioId: usuario.id,
                        correoId: id_correo_favorito
                    }
                });
                console.log(`El correo se ha guardado como favorito exitosamente`);
                return {
                    estado: 201,
                    mensaje: "Correo marcado como favorito"
                };
            } else {
                console.log(`El usuario no es el remitente ni destinatario`);
                return {
                    estado: 403,
                    mensaje: "Operacion fallida, el correo que intentas marcar no te pertenece"
                };
            }

        } else {
            console.log(`Credenciales incorrectas`);
            return {
                estado: 401,
                mensaje: 'Usuario y/o correo incorrectos'
            };
        }

    } catch (err) {
        console.log(`Error al intentar marcar correo como favorito: ${(err as Error).message}`)
        return {
            estado: 400,
            mensaje: 'Ha ocurrido un error al intentar marcar como favorito'
        };
    }
});



// Desmarcar un correo de favorito.
app.delete('/api/desmarcarcorreo', async ({ body }) => {
    try {
        const {correo, clave, id_correo_favorito} = body as Desmarcar;
        const usuario = await prisma.usuario.findUnique({ where: {correo} });

        if (usuario && id_correo_favorito && usuario.clave === clave) {
            const correillo = await prisma.correo.findUnique({
                where: {id: id_correo_favorito}});

            if (!correillo) {
                console.log('No se ha encontrado el correo');
                return {
                    estado: 404,
                    mensaje: 'No se ha encontrado el correo'
                };
            }
            
            if (correillo.remitenteId === usuario.id || correillo.destinatarioId === usuario.id){
                await prisma.favorito.deleteMany({
                    where: {
                        usuarioId: usuario.id,
                        correoId: id_correo_favorito
                    }
                });

                console.log(`El correo se ha quitado de favoritos con exito`);
                return {
                    estado: 200,
                    mensaje: "El correo se ha quitado de favoritos"
                };

            } else {
                console.log(`El usuario no es el remitente ni destinatario`);
                return {
                    estado: 403,
                    mensaje: 'Operacion fallida, el correo que intentas desmarcar no te pertenece'
                };
            }

        } else {
            console.log(`Credenciales incorrectas`);
            return {
                estado: 401,
                mensaje: 'Usuario y/o correo incorrectos'
            };
        }
        
    } catch (err) {
        console.log(`Error al intentar quitar correo de favoritos: ${(err as Error).message}`);
        return {
            estado: 500,
            mensaje: 'Ha ocurrido un error al intentar quitar correo de favorito'
        };
    }
});



app.listen(3000, () => {
    console.log('🦊 Elysia is running on http://localhost:3000');
});
