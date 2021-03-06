import React, { useState } from "react";
import { Link } from "react-router-dom";
import { firestoreConnect, populate } from "react-redux-firebase";
import firebase from "../Firebase";
import { compose } from "redux";
import { connect } from "react-redux";
import { firebaseUrl } from "../storageFirebaseUpload"

import "./Project_Details_Page.css";
import defaultProjectImage from "../Images/mountain_filler.svg";
import approve from "../Icons/check-mark-circle-line.svg"
import { ProjectDetailList } from "./Project_Edit_Details";
import { SubmitButton, CancelButton, AddDetailButton} from "./Project_Edit_Buttons";
import palettes from "./Project_Palettes";
import NavbarPad from "../Navbar/NavbarPad"
import { ImageUploadDisplay } from "./Image_Upload_Display";


function ProjectEditPage(props) {
  let project = props.project;
  let details = props.projectDetails;

  //check if data is loaded
  if (!project || !details) {
    return <div>Loading...</div>;
  }

  let profile = project.userId;

  let imageUrl = props.project.imgURL ? props.project.imgURL : defaultProjectImage;
  let palette = profile.template? palettes[profile.template]:palettes["Professional"];

  let headerStyle = { background: palette.primary, color: palette.secondary };
  let dateStyle = { color: palette.detail };
  let descriptionStyle = {
    background: palette.secondary,
    color: palette.detail,
  };
  let detailStyle0 = { background: palette.detail, color: palette.secondary };
  let detailStyle1 = { background: palette.secondary, color: palette.detail };

  const maxTitleLength = 320;

  const handleAddDetail = () => {
    let nDetails = project.nDetails?project.nDetails:0;
    //Add detail document
    firebase.firestore()
    .collection("projectDetails")
    .add({
      projectId:props.match.params.id,
      type:"default",
      position:nDetails,
    })

    //update project
    firebase.firestore()
    .collection('projects')
    .doc(props.match.params.id)
    .update({nDetails:nDetails+1})
  }

  const handleDeleteDetail = (detailId) => {
    let nDetails = project.nDetails;
    let detColRef =firebase.firestore().collection("projectDetails")

    //delete detail
    detColRef.doc(detailId).delete();

    //update project
    firebase.firestore()
    .collection('projects')
    .doc(props.match.params.id)
    .update({nDetails:nDetails-1})

    //update other detail positions
    let pos = 0;
    details.forEach(detail => {
      if(detail.id!==detailId){
        detColRef.doc(detail.id).update({position:pos});
        pos++;
      }
    });
  }

  const DoneEditButton = () => {
      return(<Link id="editProjectButton" to={"/project/"+props.match.params.id}><img src={approve} id="editProjectButton" alt=""/></Link>)
  }

  const handleHeaderSubmit = ({ projectTitle, projectImage }) => {
    if(projectTitle && projectTitle.length > maxTitleLength){
      window.alert(`Title is too long, must be less than ${maxTitleLength} characters`)
      return;
    } else if(!projectTitle || projectTitle.length <= 0){
      window.alert("Project must have a title");
      return;
    } else {
      firebase.firestore()
      .collection('projects')
      .doc(props.match.params.id)
      .update({projectName:projectTitle, imgURL: projectImage});
    }
  }

  const handleDescSubmit = (projectDescription) => {
    let ref = firebase.firestore()
    .collection('projects')
    .doc(props.match.params.id);
    ref.update({projectDesc:projectDescription});
  }

  const handleReflSubmit = (reflection) => {
    let ref = firebase.firestore()
    .collection('projects')
    .doc(props.match.params.id);
    ref.update({reflection:reflection});
  }

  return (
    <div className="projectLayout">
      <DoneEditButton/>
      <NavbarPad color={palette.primary}/>
      <ProjectHeader 
        style={headerStyle} 
        dateStyle={dateStyle}
        project={project} 
        submit={handleHeaderSubmit}
        imageUrl={imageUrl} 
      />
      <ProjectDescription 
        style={descriptionStyle} 
        project={project} 
        submit={handleDescSubmit}
      />      
      <ProjectDetailList
        details={details}
        style0={detailStyle0}
        style1={detailStyle1}
        handleDelete={(id)=>(handleDeleteDetail(id))}
      />
      <ProjectReflection
        style={descriptionStyle} 
        project={project} 
        submit={handleReflSubmit} 
      />
      <div className="addDetail">
        <AddDetailButton add={handleAddDetail}/>
      </div>
    </div>
  );
}

const ProjectHeader = (props) => {
  let project = props.project;
  let style = props.style;
  let dateString = getPostDateString(project.postDate);
  let originalTitle = project.projectName;
  let originalImage = project.imgURL;

  const [projectTitle, setProjectTitle] = useState(project.projectName);
  const [titleSubmitDisable, setTitleSubmitDisable] = useState(true);
  const [projectImage, setProjectImage] = 
    useState(project.imgURL?project.imgURL:defaultProjectImage);

  const updateField = (e) => {
    let fieldValue = e.target.value;
    let id = e.target.id;
    switch (id) {
      case "titleEntry":
        setProjectTitle(fieldValue);
        setTitleSubmitDisable(false);
        break;
      case "imageUpload main":
        if(e.target.files[0].size < 1000000){
          firebaseUrl(e.target.files[0]).then(url=>{
            setProjectImage(url);
            setTitleSubmitDisable(false);
          });
        }else{
          window.alert("Images must be less than 1 MB large")
          return;
        }
        break;
      default:
        break;
    }
    
  };

  const handleSubmit = () => {
      props.submit({projectTitle, projectImage});
      setTitleSubmitDisable(true);
  }

  const handleCancel = () => {
    setProjectTitle(originalTitle);
    setProjectImage(originalImage);
    setTitleSubmitDisable(true);
  }


  return(
    <div className="projectDetail" id="header" style={style}>
      <div className="detailImageWrap" id="left">
        <ImageUploadDisplay detailId="main" handleChange={updateField} imageUrl={projectImage}/>
      </div>
      <div className="projectTitle">
        <input
          type="text"
          id="titleEntry"
          value={projectTitle}
          onChange={updateField}
        />
        <div className="projectAuthor">{project.authorName}</div>
        <div className="projectDate" style={props.dateStyle}>
          {dateString}
        </div>
        <div className="detailEditButtons">
          <SubmitButton 
            submit={handleSubmit}
              submitDisabled={titleSubmitDisable}
          />
          <CancelButton 
            cancel={handleCancel}
            cancelDisabled={titleSubmitDisable}
          />

        </div>
        
      </div>
    </div>
  )
}

const ProjectDescription = (props) => {
  
  let project = props.project;
  let style = props.style;

  let originalDesc = project.projectDesc;

  const [projectDescription, setProjectDescription] = useState(project.projectDesc);
  const [descSubmitDisable, setDescSubmitDisable] = useState(true);


  const updateField = (e) => {
    let fieldValue = e.target.value;
    let id = e.target.id;
    switch (id) {
      case "descriptionEntry":
        setProjectDescription(fieldValue);
        setDescSubmitDisable(false);
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    props.submit(projectDescription)
    setDescSubmitDisable(true);
  }

  const handleCancel = () => {
    setProjectDescription(originalDesc);
    setDescSubmitDisable(true);
  }

  return(
    <div className="projectDetail" style={style}>
        <div className="detailTitle" style={style}>
          Description
        </div>
        <div className="detailContent">
          <textarea
            className="detailText"
            id="descriptionEntry"
            value={projectDescription}
            onChange={updateField}
          />
        </div>
        <div className="detailEditButtons">
        <SubmitButton 
          submit={handleSubmit} 
          submitDisabled={descSubmitDisable}
        />
        <CancelButton 
          cancel={handleCancel}
          cancelDisabled={descSubmitDisable}
        />
        </div>
        
      </div>
  )
}

const ProjectReflection = (props) => {
  
  let project = props.project;
  let style = props.style;

  let originalReflection = project.reflection;

  const [reflection, setReflection] = useState(project.reflection);
  const [submitDisable, setSubmitDisable] = useState(true);


  const updateField = (e) => {
    let fieldValue = e.target.value;
    let id = e.target.id;
    switch (id) {
      case "reflectionEntry":
        setReflection(fieldValue);
        setSubmitDisable(false);
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    props.submit(reflection)
    setSubmitDisable(true);
  }

  const handleCancel = () => {
    setReflection(originalReflection);
    setSubmitDisable(true);
  }

  return(
    <div className="projectDetail" style={style}>
        <div className="detailTitle" style={style}>
          Reflection
        </div>
        <div className="detailContent">
          <textarea
            className="detailText"
            id="reflectionEntry"
            value={reflection}
            onChange={updateField}
          />
        </div>
        <div className="detailEditButtons">
        <SubmitButton 
          submit={handleSubmit} 
          submitDisabled={submitDisable}
        />
        <CancelButton 
          cancel={handleCancel}
          cancelDisabled={submitDisable}
        />
        </div>
      </div>
  )
}

const getPostDateString = (postDate) =>{
  if(postDate){
    let timestamp = new firebase.firestore.Timestamp(postDate.seconds, postDate.nanoseconds);
    console.log({timestamp})
    let date =  timestamp.toDate();
    console.log({date})
    let dateString =
      date.getDate() +
      "." +
      (date.getMonth() + 1) +
      "." +
      date.getFullYear();
      return dateString;
  }else{
    return "";
  }
}

const populates = [{child:'userId', root:'users'}];

const mapStateToProps = ({firebase, firestore}, ownProps) => {
  const id = ownProps.match.params.id;
  return {
      project: populate(firestore, `projects/${id}`, populates),
      projectDetails: firestore.ordered.projectDetails,
  };
};

export default compose(
  connect(mapStateToProps),
  firestoreConnect((props) => {
      let pid = props.match.params.id;
      return [
          {
              collection: "projectDetails",
              orderBy: "position",
              where: [["projectId", "==", pid]],
          },
          { collection: "projects", populates, doc: pid },
      ];
  })
)(ProjectEditPage);

