import express, { request } from 'express'
import mysql from 'mysql2/promise'
import { myConfig } from './configDatabase.js'

const app=express()
app.use(express.json())

let connection

try {
    connection=mysql.createPool(myConfig)
    //egy teszt mert a connectionPool csak létrehozza a pool objektumot de nem ellenorzi hogy letezik e
    await connection.execute('select 1')
    console.log('sikeres adat');
} catch (error) {
    console.log('HIBBBBAAAAAA',error)
    process.exit(1)//leallitja a programot hiba miatt
    
}
app.get('/todos',async (request,response)=>{
    try {
        const sql='select * from todolist order by timestamp'
        const [rows,fields]=await connection.execute(sql)
        //console.log(rows,fields);
        response.status(200).send(rows)
    } catch (error) {
        console.log(error);
    }
})
app.post('/todos',async (request,response)=>{
    const {task}=request.body
    try {
        const sql='insert into todolist (task) values(?)'
        await connection.execute(sql,[task])
        response.status(200).json({msg:'sikeres hozzáadás!'})
    } catch (error) {
        console.log(error);
    }
})

app.patch('/todos/:id',async(request,response)=>{
    const {id}=request.params
    try {
        const sql='update todolist set complete=NOT complete WHERE id=?'
        const [rows]=await connection.execute(sql,[+id])
        console.log(rows, rows.affectedRows);
        response.status(200).json({msg:'Sikeres módósítás!'})
    } catch (error) {
        console.log(error)
    }
})

app.delete('/todos/:id',async(request,response)=>{
    const {id}=request.params
    try {
        const sql='DELETE from todolist where id=?;'
        const [rows]=await connection.execute(sql,[+id])
        console.log(rows, rows.affectedRows);
        response.status(200).json({msg:'Sikeres Törlés!'})
    } catch (error) {
        console.log(error)
    }
})

const port =process.env.PORT || 8000
app.listen(port,()=>console.log(`server listening on port: ${port} ...`))