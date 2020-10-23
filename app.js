// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyCalYFjwlK_9S0c6hdqWiG263o0NHK75sQ",
    authDomain: "qr-attendance-c0e78.firebaseapp.com",
    databaseURL: "https://qr-attendance-c0e78.firebaseio.com",
    projectId: "qr-attendance-c0e78",
    storageBucket: "qr-attendance-c0e78.appspot.com",
    messagingSenderId: "24476187079",
    appId: "1:24476187079:web:5f8f93c56dfd3a3dbe81e2",
    measurementId: "G-ZZ0QPBDVZQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();


///############ QR Code stuff #############################
var qrcode = new QRCode("qrcode");

function makeCode() {
    qrcode.makeCode(lecIdGen());
}

//makeCode();
//############### QR code Stuff End  #########################

//subject selection form
var subsAndModules = {};
subsAndModules['IT'] = ['FCP', 'FN', 'BA', 'OOP', 'WebAD', 'WinAD', 'PHP', 'SAD', 'DAD', 'MAD'];
subsAndModules['BM'] = ['BCom', 'BInfo', 'BAccount', 'BAnalysis'];

//function to populate drop down list based on selection
function SelectSubList() {
    var subList = document.getElementById("subject");
    var moduleList = document.getElementById("module");
    var selSub = subList.options[subList.selectedIndex].value;
    while (moduleList.options.length) {
        moduleList.remove(0);
    }
    var subjects = subsAndModules[selSub];
    if (subjects) {
        //var i;
        for (i = 0; i < subjects.length; i++) {
            var module = new Option(subjects[i]);
            moduleList.options.add(module);
        }
    }
}

//function to make sure all data is entered
function inputValidate() {
    var subject = document.getElementById("subject");
    var module = document.getElementById("module");
    var batchNo = document.getElementById("batch");
    var lectureNo = document.getElementById("lecture");

    if (subject.options[subject.selectedIndex].value == "-- Subject --") {
        subject.focus();
        subject.classList.add("nullFocus");
    } else {
        subject.classList.remove("nullFocus");
        var subjectTxt = subject.options[subject.selectedIndex].value;
    }

    if (module.options[module.selectedIndex].value == "-- Module --") {
        module.focus();
        module.classList.add("nullFocus");
    } else {
        module.classList.remove("nullFocus");
        var moduleTxt = module.options[module.selectedIndex].value;
    }

    if (batchNo.value >= 1) {
        batchNo.classList.remove("nullFocus");
        var batchTxt = batchNo.value;
    } else {
        batchNo.focus();
        batchNo.classList.add("nullFocus");
    }

    if (lectureNo.value >= 1) {
        lectureNo.classList.remove("nullFocus");
        var lectureTxt = lectureNo.value;
    } else {
        lectureNo.focus();
        lectureNo.classList.add("nullFocus");
    }

    return [subjectTxt, moduleTxt, batchTxt, lectureTxt];
}

//creaate and concatenate the string for lecture ID
function lecIdGen() {

    let lecIdArr = inputValidate();

    var lecIdString = lecIdArr[0] + "_" + lecIdArr[1] + "_" + lecIdArr[2] + "_" + lecIdArr[3];

    setCookie(lecIdString, 15);

    return lecIdString;
}

//function to create new collection and document for lecture in firestore
function addFire() {
    let lecIdArr = inputValidate();
    db.collection("lectures").doc(lecIdGen()).set({
            subject: lecIdArr[0],
            module: lecIdArr[1],
            batch: lecIdArr[2],
            lecNo: lecIdArr[3]
        })
        .then(function () {
            makeCode();
            listenAttendees();
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

}

//function save lecture ID as cookie
function setCookie(cvalue, exmins) {
    var cName = "lecString";
    var d = new Date();
    d.setTime(d.getTime() + (exmins * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cName + "=" + cvalue + ";" + expires + ";path=/";
}

//function to get saved lecture id from cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//function to listen to changes in firestore lecture/ StudentsAtteneded directory and push concatenated first and last name into an array
function listenAttendees() {
    db.collection("lectures").doc(getCookie("lecString")).collection("studentsAttended").onSnapshot(function (querySnapshot) {
        var names = [];
        querySnapshot.forEach(function (doc) {
            var fname = doc.data().Fname;
            var lname = doc.data().Lname;

            var fullName = fname + " " + lname;

            names.push(fullName);
        });
        makeUL(names);
    });
}

//function access dom and create new li for each value in names array from listenAttendees function
function makeUL(array) {
    // Create the list element:
    var list = document.getElementById('liveAttendance');

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        list.innerHTML="";
        // Add it to the list:
        list.appendChild(item);
    }
}