const {MongoClient, ObjectId} = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// operations


async function connectDB()
{
    try
    {
        await client.connect();
        return client.db('plp_bookstore').collection('books')
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
}

const databaseName = "plp_bookstore";
const collectionName = "books"


async function showBooks()
{
    try
    {
        await client.connect();
        const books = client.db('plp_bookstore').collection('books');
        const book_data =  await  books.find().toArray();
        console.log(book_data);
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
}
showBooks();


// search function
async function SearchBook(bookId)
{
    try
    {
        await client.connect();
        const booksCollection =  client.db(databaseName).collection(collectionName);
        const cursor = await booksCollection.find({_id: new ObjectId(`${bookId}`) });
        console.log(`Searched book is: `);
        // console.log(cursor);

        await cursor.forEach((dataItem)=>{console.log(dataItem)});
        // console.log()
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
    finally
    {
        client.close();
    }
}
let book_to_search = '683974c10467c054b17590e9';
SearchBook(book_to_search); //works


//aggregation methods

//check if any author has written mutlipe books
async function SearchAuthor()
{
    try
    {
        await client.connect();
        const booksCollection = await client.db(databaseName).collection(collectionName);
        // const booksData = await booksCollection.find().toArray();
        // const result = await booksCollection.aggregate(
        //     [{$group : {_id: "$author", totalBooks: {$sum: 1} } }]
        // );
        const result = await booksCollection.aggregate(
            [
                {
                    $group: {
                    _id: "$author",  // Group by author field
                    bookCount: { $sum: 1 }  // Count books per author
                    }
                },
                { 
                    $sort: { bookCount: -1 }  // Optional: sort by count descending
                }
            ]
        ).toArray()
        console.log(result);
;
    }
    catch(err)
    {
        console.log(`Error : ${err}`);
    }
    finally
    {
        client.close();
    }
}
SearchAuthor() //working


//check number of books based on genre
async function GetBookGenre()
{
    try
    {
        await client.connect();
        const booksCollection = await client.db(databaseName).collection(collectionName);
        const result = await booksCollection.aggregate([
            {$group : 
                {
                    _id: "$genre",
                    GenreCount: {$sum: 1}
                }
                
            }
        ]).toArray()

        console.log("Genre Count :")
        console.log(result);
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
    finally
    {
        client.close();   
    }
}
GetBookGenre();


// check publishers have  published number of books
const GetPublisher = async ()=>{
    try
    {
        const booksCollection = await connectDB();
        const result = await booksCollection.aggregate([
            {$group: 
                {_id: "$publisher", publisherCounts:{$sum: 1}}
            },
            {
                $sort: {publisherCounts: -1}
            }
        ]).toArray();
        console.log("Publisher Counts:")
        console.log(result);
    }
    catch(err)
    {
        console.log(`Error: ${err}`);
    }
    finally
    {
        client.close();
    }
}
GetPublisher(); // works

//check availability of book based on in_stock
const FindBookAvailability = async (availabilityBoolean)=>{
    try
    {
        const booksCollection = await connectDB();
        const results = await booksCollection.aggregate([
            {
                $match: {in_stock: availabilityBoolean}
            }
        ]).toArray();
        console.log(`Book Availability : ${availabilityBoolean}`)
        results.forEach((dataItem)=>{
            // console.log(`Book Title: ${dataItem.title} \t Book Author: ${dataItem.author} \t Book Genre: ${dataItem.genre} \t Price: ${dataItem.price}`)
            console.log(`Book Title: ${dataItem.title}  Price: ${dataItem.price} \n\n`)
        })
    }
    catch(err)
    {
        console.log(`Error : ${err}`);
    }
    finally
    {
        client.close();
    }
}
FindBookAvailability(true); // working

//sorting on price
const PriceSort = async (priceBool)=>{
    try
    {
        const booksCollection = await connectDB();
        //tenary operation varaible === requirement ? true:value : false: value
        const value = priceBool === true ? -1 : 1
        const result = await booksCollection.aggregate([
            {
                $sort: {price: value}
            }
        ]).toArray();
        const sortMethod = value === -1 ? "Descending" : "Ascending";
        console.log(`Books Listed in ${sortMethod}`);
        console.log(result);
    }
    catch(err)
    {
        console.log(`Error: ${err}`)
    }
    finally
    {
        client.close();
    }
}

PriceSort(true); //works
