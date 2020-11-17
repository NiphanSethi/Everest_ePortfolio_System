import React from 'react';
import { Link } from 'react-router-dom'
import "../Projects/ProjectList.css";

function Project(props) {

    return (
      <div className="project">

        <Link to = {`/projects/${props.uid}/project/${props.pid}`} >
            <img className="projectImage" src={props.image} alt="projectImage" />
        </Link>

        <div className="projectNameAndDesc">

            <Link to = {`/projects/${props.uid}/project/${props.pid}`} >
                <h2 className="projectName" >{props.name}</h2>
            </Link>

            <p className="projectDesc">{props.description}</p>

        </div>

        <p className="projectBody">{props.body}</p>

        <p className="projectTags">{props.tags}</p>


      </div>
    );
  }

export default Project;
