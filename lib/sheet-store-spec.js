
var expect = require('chai').expect;
var SheetStore = require('./sheet-store');


describe("Sheet Entity Store", function() {

  var exampleSchema = {
    fields: {

      //Common fields don't need any data conversion
      common: ["id", "title", "workflowId", "assignee"],
      json: {
        location: {
          sheetFields: [{
            path: 'lat',
            convert: function(val) {
              return parseFloat(val);
            }
          }, {
            path: 'long',
            convert: function(val) {
              return parseFloat(val);
            }
          }]
        },
        testObject: {
          sheetFields: {
            path: 'testSheetPath',
            convert: function(val) {
              return parseInt(val);
            }
          }
        }
      },
      sheet: {
        testSheetPath: {
          path: "testObject",
          convert: function(val) {
            return String(val);
          }
        },
        lat: {
          path: 'location[0]'
        },
        long: {
          path: 'location[1]'
        }
      }
    }
  };

  var exampleJSONObject = {
    id: "testid",
    title: "testtitle",
    workflowId: "testworkflowid",
    assignee: "testassignee",
    location: [22.3, 32.2],
    testObject: 15
  };

  var exampleRowObject = {
    id: "testid",
    title: "testtitle",
    workflowid: "testworkflowid",
    assignee: "testassignee",
    lat: 22.3,
    long: 32.2,
    testsheetpath: "15"
  };

  it("Converting JSON Entities To Sheet Row Entries", function() {
    var testSheetStore = new SheetStore('testdatasetid', 'testsheetid', exampleSchema);

    var entity = testSheetStore.convertJSONEntityToRow(exampleJSONObject);

    expect(entity._id).to.equal(exampleJSONObject.id);
    expect(entity._title).to.equal(exampleJSONObject.title);

    delete entity._id;
    delete entity._title;

    expect(entity).to.deep.equal(exampleRowObject);
  });

  it("Converting Row Sheet Entries to JSON Entities", function() {
    var testSheetStore = new SheetStore('testdatasetid', 'testsheetid', exampleSchema);

    var entity = testSheetStore.convertRowEntityToJSON(exampleRowObject);

    expect(entity).to.deep.equal(exampleJSONObject);
  });

});