# raincatcher-google-salesforce-store

An example package for storing Raincatcher data in Salesforce.

This module is based on [this](https://www.npmjs.com/package/jsforce) module for interacting with salesforce.

## Setup


```javascript
var SFStore = require('raincatcher-google-salesforce-store');

var config = {
  credentials: {
    user: <<username>>,
    password: <<password and security token>>
  }
};

SFStore.connect(config).then(function() {
  console.log("Authenticated to SalesForce");
}).catch(function(err) {
  console.log("An Error Occurred when connecting to SalesForce", err);
});
```

See the [jsforce](https://jsforce.github.io/document/#username-and-password-login) module for more information on the `credentials` object.


## Creating A Single Salesforce Store


```javascript

var mediator = require('fh-wfm-mediator/lib/mediator');
var SFStore = require('raincatcher-google-salesforce-store').

//The datasetId is used to generate the topics that this store will subscribe to.
var datasetId = 'workorders';


//Creating an example schema to be used
var exampleSchema = {
    fields: {

      //Common fields don't need any data conversion between JSON and sheet
      // common: ["id", "title", "workflowId", "assignee"],
      common: ["status", "priority", "id"],
      sfQueryFields: ["Id", "CaseNumber","Status","Priority","Type","Subject",
      "User__c","Address__c","Lat_Long__Latitude__s","Lat_Long__Longitude__s"],
      // wfmFields: ["id", "status", "priority", "title", "description", "assignee"],
      //Fields assigned to JSON that need to be parsed from the google sheet.
      //In this example, the `location` field is an Array with `lat` and `long` values plucked
      //from the google sheet columns.
      json: {
        workorderid: {
          sfFields: {
            path: 'CaseNumber'
          }
        },
        title: {
          sfFields: {
            path: 'Type'
          }
        },
        description: {
          sfFields: {
            path: 'Subject'
          }
        },
        assignee: {
          sfFields: {
            path: 'User__c'
          }
        },
        address: {
          sfFields: {
            path: 'Address__c'
          }
        },
        finishDate: {
          sfFields: {
            path: 'Finish_Date_Time__c'
          }
        },
        location: {
          sfFields: [{
            path: 'Lat_Long__Latitude__s',
            //The value coming from the google sheet is a string,
            //It should be a number in the JSON object.
            convert: function(val) {
              return parseFloat(val);
            }
          }, {
            path: 'Lat_Long__Longitude__s',
            convert: function(val) {
              return parseFloat(val);
            }
          }]
        }
      },
      salesforce: {
        // CaseNumber: {
        //  path: 'workorderid'
        // },
        Type: {
          path: 'title'
        },
        User__c: {
          path: 'assignee'
        },
        Subject: {
          path: 'description'
        },
        Address__c: {
          path: 'address'
        },
        Lat_Long__Latitude__s: {
          path: 'location[0]'
        },
        Lat_Long__Longitude__s: {
          path: 'location[1]'
        },
        Finish_Date_Time__c: {
          path: 'finishDate'
        }
      }
    }
  };

var workorderSFStore = new SFStore(datasetId, exampleSchema);

var topicPrefix = 'wfm:data';


//The salesforce store has now subscribed to the documents documented below.
workorderSFStore.listen(topicPrefix, mediator);
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



