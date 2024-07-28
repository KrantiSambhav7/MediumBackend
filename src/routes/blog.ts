import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL: string,
        JWT_SECRET : string
    },
    Variables : {
        userId : string ;
    }
}>();

blogRouter.use('/*' ,async (c,next) => {
    const authHeader  = c.req.header("Authorization") ;

    if(!authHeader){
        return c.json({
            message : "Unauthorized"
        });
    }

    const token = authHeader.split(' ')[1] ;
    const user = await verify(token  , c.env.JWT_SECRET) ; 

    if(user){
        //@ts-ignore
        c.set('userId' , user.id);
        next() ;
    }else{
        return c.json({
            message : "Unauthorized"
        }); 
    }

});

blogRouter.post('/', async (c) => {
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
  
      const body = await c.req.json() ;
      const authorId = c.get("userId") ;

      const blog = await prisma.post.create({
        data : {
        title : body.title,
        content : body.content,
        authorId : parseInt(authorId)
        }

      })
    
    return c.text("Blog Created");
  });
  
blogRouter.put('/', async (c) => {

        
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
  
      const body = await c.req.json() ;
       
      const blog = await prisma.post.update({
        where : {
            id : body.id
        },data : {
            title : body.title,
            content : body.content
        }
      })
    
    return c.text("Blog Updated");

  });

  
blogRouter.get('/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
  
      const body = await c.req.json() ;
       
      const blog = await prisma.post.findMany({})
    
    return c.json({
        blog : blog 
    });


    return c.text("Jej e");
});


blogRouter.get('/:id',async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

      const id = await c.req.param("id");
       
      const blog = await prisma.post.findFirst({
        where : {
            id : parseInt(id) 
        }
      })
    
    return c.json({
        blog : blog 
    });


  });

  