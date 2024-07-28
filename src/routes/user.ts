import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt'
import {z} from "zod" 

export const userRouter = new Hono<{
    Bindings : {
        DATABASE_URL: string,
        JWT_SECRET : string
    }
}>();


userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();

    try {
  
      const user  = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: body.password,
        },
      });
      const userId = user.id;
      const token = await sign({userId : userId} , c.env.JWT_SECRET);
  
      return c.text(token);
  
    } catch (e) {
      return c.status(411);
    }
  });
  
  userRouter.post('/api/v1/user/signin',async (c) => {
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
  
    try {
  
      const user  = await prisma.user.findFirst({
        where : {
          email: body.email,
          password: body.password,
        },
      });
  
      if(!user){
        return c.status(403);
      }
  
      const userId = user.id;
      const token = await sign({userId : userId} , c.env.JWT_SECRET);
  
      return c.text(token);
  
    } catch (e) {
      return c.status(411);
    }

  });
  




 