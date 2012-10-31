School Yard Content API
=========================

The School Yard Content API is a semi-RESTful api for storing text content in a datastore. It's similar in structure to the
way Amazon S3 structures it's content storage.

It can be used to power a variety of clients, attempting to break the typical large scale CMS system architecture.

**Status**: Experimental

## Overview

The API is structrued into **Buckets** and **Items**. A **Bucket** is a grouping of similar items and can be defined any way your application or data needs to be structured. Each Bucket must contain a unique URL encoded name, so it could mirror your application's URL structure or be split by resource name, etc.

An **Item** is a unquie piece of content within a **Bucket**. By default all it has is a URL encoded name property. To add more information about item you will add `key/value` style **properties** to it.

Off the shelf the API uses [Schoolyard-Recess](https://github.com/School-Yard/Recess) to implement a versioned API using [Card-Catalog](https://github.com/School-Yard/Card-Catalog) cards.

It contains a `CORS` *([http://www.w3.org/TR/cors/](http://www.w3.org/TR/cors/))* middleware component to allow access from any domain so that the API can be used directly from a client application or accessed through a server.

It also implements an `HMAC` middleware check so that you can control who is able to access the API.

## Install and Run

To install dependencies run:

```bash
$ npm install
``

from within the root directory.

Then to start the server make sure you have `MongoDB` running and run:

```bash
$ node app.js
```

## Customizing

To run this on your own server you will probably  want to make a few changes. By default it uses a **MongoDB** datastore but is built on the [Trapperkeeper](https://github.com/School-Yard/TrapperKeeper) project so this can be changed to use another database, such as **mysql** without much change. To do this simply edit the [/lib/utils/dbConnect.js](https://github.com/School-Yard/Content-Server/blob/master/lib/utils/dbConnect.js) file and setup another database.

If you would like to change the way requests are authenticated with the HMAC check you can change the signature algorithm in [/lib/middleware/hmac_check.js](https://github.com/School-Yard/Content-Server/blob/master/lib/middleware/hmac_check.js) to use anything you would like.

## RESTful API Methods

**Current Version**: v1

All methods return JSON.

### Buckets

***

**GET /api/v1/buckets**

*min role: 0*

Returns an array of bucket objects.

```json
[
  {"name":"test","ctime":1351710371563,"mtime":"","id":"123"},
  {"name":"another-test","ctime":1351710371563,"mtime":"","id":"1234"}
]
```

***

**GET /api/v1/buckets/:name**

*min role: 0*

Returns a bucket and a list of items it contains.

```json
{
  "name":"test",
  "ctime":1351710371563,
  "mtime":"",
  "id":"123",
  "items":[
    {
      "bucket_id":"123",
      "name":"test-item",
      "ctime":1351710990633,
      "mtime":"",
      "id":"456"
    }
  ]
}
```

***

**POST /api/v1/buckets**

*min role: 2*

Creates a new Bucket object.

**Required Parameters**

- **name** : a unique URL encoded name attribute

```json
{
  "name":"test",
  "ctime":1351711241047,
  "mtime":"",
  "id":"123"
}
```

***

**PUT /api/v1/buckets/:name**

*min role: 2*

Updates an existing Bucket's name property.

**Required Parameters**

- **name** : a unique URL encoded name attribute

```json
{
  "name":"test-update",
  "ctime":1351711241047,
  "mtime":1351711425513,
  "id":"123"
}
```

***

**DELETE /api/v1/buckets/:name**

*min role: 2*

Destroys a Bucket and all it's contents. This is a cascading delete so be careful.

```json
{
  "status": 1
}
```

***

### Items

***

**GET /api/v1/buckets/:name/items**

*min role: 0*

Returns an array of items belonging to the Bucket.

```json
[
  {
    "bucket_id":"123",
    "name":"test-item",
    "ctime":1351710990633,
    "mtime":"",
    "id":"456"
  }
]
```

***

**GET /api/v1/buckets/:name/items/:name**

*min role: 0*

Return attributes for a single item, including it's properties.

```json
{
  "bucket_id":"123",
  "name":"test-item",
  "ctime":1351710990633,
  "mtime":"",
  "id":"456",
  "properties": {
    "property-1": {
      "value":"value-1",
      "ctime":1351712177050,
      "mtime":"",
      "id":"789"
     },
     "property-2":{
       "value":"value-2",
       "ctime":1351712177051,
       "mtime":"",
       "id":"101112"
     }
  }
}
```

***

**POST /api/v1/buckets/:name/items**

*min role: 2*

Creates a new Item inside a Bucket.

**Required Parameters**

- **name** : a unique URL encoded name attribute

```json
{
  "bucket_id":"123",
  "name":"test-item",
  "ctime":1351712455931,
  "mtime":"",
  "id":"456"
}
```

***

**PUT /api/v1/buckets/:name/items/:name**

*min role: 2*

Updates an existing Items's name property.

**Required Parameters**

- **name** : a unique URL encoded name attribute

```json
{
  "bucket_id":"123",
  "name":"test-item-updated",
  "ctime":1351712455931,
  "mtime":1351712605153,
  "id":"456"
}
```

***

**DELETE /api/v1/buckets/:name/items/:name**

*min role: 2*

Destroys an Item and all it's properties. This is a cascading delete so be careful.

```json
{
  "status": 1
}
```

***

### Properties

***

**GET /api/v1/buckets/:name/items/:name/properties**

*min role: 0*

Get all the properties associated with an Item.

```json
[
  {
    "item_id":"456",
    "key":"property-1",
    "value":"value-1",
    "ctime":1351712177050,
    "mtime":"",
    "id":"789"
  },
  {
    "item_id":"456",
    "key":"property-2",
    "value":"value-2",
    "ctime":1351712177051,
    "mtime":"",
    "id":"101112"
  }
]
```

***

**GET /api/v1/buckets/:name/items/:name/properties/:id**

*min role: 0*

Get a single Item property.

```json
{
  "item_id":"456",
  "key":"property-1",
  "value":"value-1",
  "ctime":1351712177050,
  "mtime":"",
  "id":"789"
}
```

***

**POST /api/v1/buckets/:name/items/:name/properties**

*min role: 2*

Create a new property for an Item.

*Accepts an array of objects or a single object containing the following parameters*

Will always return an array.

**Required Parameters**

- **Key** : a key for the property name

**Optional Parameters**

- **Value** : a value for the property

```json
[
  {
    "item_id":"456",
    "key":"property-1",
    "value":"",
    "ctime":1351713617454,
    "mtime":"",
    "id":"789"
  }
]
```

***

**PUT /api/v1/buckets/:name/items/:name/properties**

*min role: 2*

Update an existing Item's properties.

*Accepts an array of objects or a single object containing the following parameters*

Will always return an array.

**Required Parameters**

- **Key** : a key for the property name

**Optional Parameters**

- **Value** : a value for the property

```json
[
  {
    "item_id":"456",
    "key":"property-1",
    "value":"abc",
    "ctime":1351713617454,
    "mtime":1351714032318,
    "id":"789"
  }
]
```

***

**DELETE /api/v1/buckets/:name/items/:name/properties/:id**

*min role: 2*

Destroy an Item property.

```json
{
  "status": 1
}
```

## Tests

All tests are written in [mocha](https://github.com/visionmedia/mocha) and should be run with npm.

```bash
$ npm test
```

## License

(The MIT License)

Copyright (c) 2012 Texas School Safety Center <txssc@txstate.edu>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.