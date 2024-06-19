import {Elysia} from "elysia";
import {PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();
const app = new Elysia();


app.listen(3000, () => {
    console.log('🦊 Elysia is running on http://localhost:3000');
});


