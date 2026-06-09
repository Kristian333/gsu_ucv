import React, { useState } from 'react';
import useDrivePicker from 'react-google-drive-picker'


<h1>Hola</h1>
function App() {
  const [openPicker, setOpenPicker] = useDrivePicker();  
  const [selectedFiles,setSelectedFiles]= useState([])
  const handleOpenPicker = () => {
    openPicker({
      clientId: "xxxxxxxxxxxxxxxxx",
      developerKey: "xxxxxxxxxxxx",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data)
      },
    })
  }

    

  return (
    <div style={{padding:"20px",textAlign:"center"}}>
        <button onClick={() => handleOpenPicker()}>Open Picker</button>

    </div>
  )
  }

export default App;