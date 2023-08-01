let express=require("express")
let app=express()
app.use(express.json())
app.use(function(req,res,next){
    res.header ("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    )
    res.header (
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
        )
next();
})
var port=process.env.PORT||2410
app.listen(port,() =>console. log(`Node App listening on port ${port}!`))
const {Client}=require("pg")
var format = require('pg-format');
const client=new Client({
    user:"postgres",
    password:"jaychopra932@gmail.com",
    database:"postgres",
    port:5432,
    host:"db.zwpjdnlwasupjnravaab.supabase.co",
    ssl:{rejectUnauthorized:false}
})
client.connect(function(res,err){
    console.log("Connected!!!")
})
let {shops,products,purchases}=require("./Data.js")

//whenever server is on
function ServerOn(){

    //DELETE Table
    let sql1=`Drop Table shops;`
    let sql2=`Drop Table purchases;`
    let sql3=`Drop Table products;`
    client.query(sql1,function(err,result){
        if(err) console.log(err)

    })
    client.query(sql2,function(err,result){
        if(err) console.log(err)

    })
    client.query(sql3,function(err,result){
        if(err) console.log(err)

    })
    //Create Table
    client.query("Create table shops (shopId serial primary key,name varchar,rent int );",function(err,result){
        if(err) console.log(err)

    })
    client.query("Create table products (productId serial primary key,productName varchar, category varchar,description varchar );",function(err,result){
        if(err) console.log(err)

    })
    client.query("Create table purchases (purchaseId serial primary key,shopId int,productid int,quantity int,price int );",function(err,result){
        if(err) console.log(err)

    })
    //Insert Values
    let arr1=shops.map((a)=>[a.name,a.rent])
    client.query(format('INSERT INTO shops ( name,rent) VALUES %L', arr1),[], (err, result)=>{
        if(err)console.log(err);
    });

    let arr2=products.map((a)=>[a.productName, a.category,a.description])
    client.query(format('INSERT INTO products (productName,category,description) VALUES %L', arr2),[], (err, result)=>{
        if(err)console.log(err);
    });

    let arr3=purchases.map((a)=>[a.shopId,a.productid,a.quantity,a.price])
    client.query(format('INSERT INTO purchases (shopId,productid,quantity,price) VALUES %L', arr3),[], (err, result)=>{
        if(err)console.log(err);
    });
    
}
ServerOn()


//main codes

app.get("/shops",function(req,res){
    let sql=`Select * from shops`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.get("/products",function(req,res){
    let sql=`Select * from products`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.get("/purchases",function(req,res){
    let {shop,product,sortBy}=req.query
    let sql=`Select * from purchases`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            let arr=[...result.rows]
            if(shop){
                arr=arr.filter((a)=>a.shopid==shop)
            }
            if(product){
                let productArr=product.split(",")
                console.log(productArr)
                arr=arr.filter((a)=>productArr.findIndex((b)=>a.productid==b)>=0)
            }
            if(sortBy=="QtyAsc"){
                arr=arr.sort((a,b)=>a.quantity-b.quantity)
            }
            if(sortBy=="QtyDesc"){
                arr=arr.sort((a,b)=>b.quantity-a.quantity)
            }
            if(sortBy=="ValueAsc"){
                arr=arr.sort((a,b)=>(a.quantity*a.price)-(b.quantity*b.price))
            }
            if(sortBy=="ValueDesc"){
                arr=arr.sort((a,b)=>(b.quantity*b.price)-(a.quantity*a.price))
            }
            res.send(arr)
        }
    })
})
app.get("/purchases/products/:id",function(req,res){
    let id=req.params.id
    let sql=`Select * from purchases where productid=${id}`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.get("/purchases/shops/:id",function(req,res){
    let id=req.params.id
    let sql=`Select * from purchases where shopid=${id}`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.get("/TotalPurchase/shops/:id",function(req,res){
    let id=req.params.id
    let sql=`select SUM(Quantity) as TotalQuantity,productId from purchases where shopId=${id} Group by productId ORDER BY productId ASC`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.get("/TotalPurchase/products/:id",function(req,res){
    let id=req.params.id
    let sql=`select shopId,SUM(Quantity) as TotalQuantity from purchases where productId=${id}  Group by shopId ORDER BY shopId ASC`
    client.query(sql,function(err,result){
        if(err) res.status(404).send("No Data Found")
        else{ 
            res.send(result.rows)
        }
    })
})
app.post("/shops",function(req,res){
    let body=req.body
    let sql=`Insert Into shops(name,rent) values('${body.name}',${body.rent})`
    client.query(sql,function(err,result){
        if(err) res.status(404).send(err)
        else{ 
            res.send(body)
        }
    })
})
app.post("/products",function(req,res){
    let body=req.body
    let sql=`Insert Into products(productName,category,description) values('${body.productname}','${body.category}','${body.description}')`
    client.query(sql,function(err,result){
        if(err) res.status(404).send(err)
        else{ 
            res.send(body)
        }
    })
})
app.post("/purchases",function(req,res){
    let body=req.body
    let sql=`Insert Into purchases(shopId,productid,quantity,price) values(${body.shopid},${body.productid},${body.quantity},${body.price})`
    client.query(sql,function(err,result){
        if(err) res.status(404).send(err)
        else{ 
            res.send(body)
        }
    })
})
app.put("/products/:id",function(req,res){
    let id=req.params.id
    let body=req.body
    let sql=`UPDATE products SET category='${body.category}',description='${body.description}' WHERE productid = ${id}`
    client.query(sql,function(err,result){
        if(err) res.status(404).send(err)
        else{ 
            res.send(body)
        }
    })
})



