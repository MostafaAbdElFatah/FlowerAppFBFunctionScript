const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// send to device that accept order 

exports.sendNotificationsToFlowerApp = functions.database
.ref('/users/{user_id}/orders/{order_id}/status')
.onWrite( (snapshot , context )=>{

    if(!snapshot.after.val()){
        return 0;
    }

    var status = snapshot.after.val();

    if(status){
        snapshot.after.ref.parent.parent.parent.once('value', function(snap) {
            const token    = snap.child('device_token').val();
            const name     = snap.child('name').val();
            const address  = snap.child('address').val();
            var title = "Hi " + name ;
            var message ="You will receive the derviry within 24 hours at the address :"+ address ;
            const payload = {
                data:{
                    title : title,
                    message : message
                }
            };
            return admin.messaging().sendToDevice(token,payload)
            .then(response =>{
                console.log("Sucessfully sent message to (Flower Server App",response); 
                return 0 ;    
            })
            .catch(error =>{
                console.log("error sending message to (Flower Server App",error); 
            });
        });
    }
  return 0 ; 
});

// to Notifications admin device
exports.sendNotificationToAdmin = functions.database
.ref('/users/{user_id}/orders/{order_id}')
.onCreate( (snapshot , context )=>{

    if(!snapshot.val()){
        return 0;
    }

   snapshot.ref.parent.parent.once('value',function(userSnap){
       const name = userSnap.child('name').val();
       const address = userSnap.child('address').val();
       const title = "Order Recive";
        const message ="You have Order at the address :"+ address + "for " + name ;
        const payload = {
            data:{
                title : title,
                message : message
            }
        };
    
        userSnap.ref.root.child('Admin').child('device_token').once('value', function(adminSnap){
            const token = adminSnap.val();
            return admin.messaging().sendToDevice(token,payload)
            .then(response =>{
                console.log("Sucessfully sent message to (Flower Server App)",response); 
                return 0 ;    
            })
            .catch(error =>{
                console.log("error sending message to (Flower Server App",error); 
            });

        })

        // end method
   }); 
   // end user snapshot
  return 0 ; 
});