
var expect = require('chai').expect;
var SFStore = require('./salesforce-store');


describe("SalesForce Store", function() {

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

  var exampleJSONObject = {
    id: "testid",
    priority: "high",
    title: "testtitle",
    status: "new",
    description: "testdescription",
    workorderid: "workorderid",
    address: "123 main st",
    assignee: "testassignee",
    location: [22.3, 32.2],
    testObject: 15
  };

  var exampleRowObject = {
    Id: "testid",
    Priority: "high",
    Type: "testtitle",
    Status: "new",
    Subject: "testdescription",
    CaseNumber: "workorderid",
    Address__c: "123 main st",
    User__c: "testassignee",
    Lat_Long__Latitude__s: 22.3,
    Lat_Long__Longitude__s: 32.2,
    testsheetpath: "15"
  };

  it("Converting WFM JSON Entities To SalesForce Entries", function() {
    var testSFStore = new SFStore('testdatasetid', exampleSchema);

    var entity = testSFStore.convertWFMEntityToSF(exampleJSONObject);
    expect(entity.User__c).to.equal(exampleJSONObject.assignee);
    expect(entity.Type).to.equal(exampleJSONObject.title);
    expect(entity.Subject).to.equal(exampleJSONObject.description);
    expect(entity.Address__c).to.equal(exampleJSONObject.address);

  });

  it("Converting SalesForce Entries to WFM JSON Entities", function() {
    var testSFStore = new SFStore('testdatasetid', exampleSchema);

    var entity = testSFStore.convertSFtoWFM(exampleRowObject);

    expect(entity.workorderid).to.equal(exampleRowObject.CaseNumber);
    expect(entity.address).to.equal(exampleRowObject.Address__c);
  });

});