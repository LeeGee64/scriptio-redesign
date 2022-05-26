import { Project } from "@prisma/client";
import { Router } from "next/router";
import { useEffect, useState } from "react";
import EmptyProjectPage from "./EmptyProjectPage";
import NewProjectItem from "./NewProjectItem";
import NewProjectPage from "./NewProjectPage";
import ProjectItem from "./ProjectItem";

type Props = {
  projects: Project[];
};

const sampleProject = {
  id: 0,
  userId: 1,
  title: "Titanic",
  description: "This is a simple description",
  createdAt: new Date(),
  updatedAt: new Date(),
  screenplay: "",
};

const ProjectPageContainer = ({ projects: propProjects }: Props) => {
  // Getting back dates from workaround
  let projects = propProjects.map((e) => ({
    ...e,
    updatedAt: new Date(e.updatedAt),
    createdAt: new Date(e.createdAt),
  }));

  // Sorting by last updated
  projects = projects.sort((a, b) => {
    if (b.updatedAt > a.updatedAt) return 1;
    return 0;
  });

  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <NewProjectPage setIsCreating={setIsCreating} />;
  } else if (projects.length === 0) {
    return <EmptyProjectPage setIsCreating={setIsCreating} />;
  } else
    return (
      <div id="project-page-container">
        <div className="center-flex">
          <h1 id="project-page-title">Projects</h1>
          <div className="project-grid">
            <NewProjectItem setIsCreating={setIsCreating} />
            {projects.map(function (project: Project) {
              return <ProjectItem project={project} />;
            })}
          </div>
        </div>
      </div>
    );
};

export default ProjectPageContainer;
