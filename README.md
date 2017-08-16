# raincatcher-google-sheet-store

An example package for storing Raincatcher data in Salesforce.

This module is based on [this](https://www.npmjs.com/package/node-salesforce) module for interacting with salesforce.

## Setup


```javascript
var sheetStore = require('raincatcher-google-sheet-store');

var config = {
  documentId: "<ID Of the Google Document That Is Being Used>",
  credentials: {
    <<Credentials to be able to access the google document.>>
  }
};

sheetStore.connect(config).then(function() {
  console.log("Authenticated to the google sheet document");
}).catch(function(err) {
  console.log("An Error Occurred when connecting to the google sheet", err);
});
```

See the [node-salesforce](https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method) module for more information on the `documentId` and `credentials` object.


## Creating A Single Google Sheet Store


```javascript

var mediator = require('fh-wfm-mediator/lib/mediator');
var SheetStore = require('raincatcher-google-sheet-store').

//The datasetId is used to generate the topics that this store will subscribe to.
var datasetId = 'workorders';

//This is the sheet ID within the document that was set up
var sheetId 'workorderSheet';

//Creating an example schema to be used
var exampleSchema = {
    fields: {

      //Common fields don't need any data conversion between JSON and sheet
      common: ["id", "title", "workflowId", "assignee"],
      
      //Fields assigned to JSON that need to be parsed from the google sheet.
      //In this example, the `location` field is an Array with `lat` and `long` values plucked 
      //from the google sheet columns.
      json: {
        location: {
          sheetFields: [{
            path: 'lat',
            //The value coming from the google sheet is a string,
            //It should be a number in the JSON object.
            convert: function(val) {
              return parseFloat(val);
            }
          }, {
            path: 'long',
            convert: function(val) {
              return parseFloat(val);
            }
          }]
        }
      },
      sheet: {
        //The `lat` and `long` columns need to be picked from the `location` array indices.
        lat: {
          path: 'location[0]'
        },
        long: {
          path: 'location[1]'
        }
      }
    }
  };

var workorderSheetStore = new SheetStore(datasetId, sheetId, exampleSchema);

var topicPrefix = 'wfm:data';


//The sheet store has now subscribed to the documents documented below.
workorderSheetStore.listen(topicPrefix, mediator);
```


## Topics

With a `topicPrefix` of `wfm:data:workorders`, this module subscribes to the following topics


| Topic | Parameters |
| ----------- | ------------- |
| `wfm:data:workorders:list` |  ```{key: 'assignee', value: 'workorderAssigneeId'}```  |
| `wfm:data:workorders:read` | ```"<<id of workorder to read>>"``` |
| `wfm:data:workorders:update` | ```{<<A valid workorder>>}``` |
| `wfm:data:workorders:create` | ```{<<A valid workorder>>}``` |
| `wfm:data:workorders:remove` | ```"<<id of workorder to remove>>"``` |



