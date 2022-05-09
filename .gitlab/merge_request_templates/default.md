## What does this MR do and why?

_Describe in detail what your merge request does and why._

| :warning: Keep an up to date checklist based on your icescrum tasks during all the draft phase to help any other developer who would take the job after you to finish it. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## Screenshots or screen recordings

_These are strongly recommended to assist reviewers and reduce the time to merge your change._

## How to set up and validate locally (or on alpha)

_List all steps to set up and validate the changes on local environment._

## MR acceptance checklist

_To be completed by the chosen reviewer._

<!---
Using checklists improves quality in software engineering and other jobs such as with surgeons and airline pilots.
More reading on checklists can be found in the "Checklist Manifesto": http://atulgawande.com/book/the-checklist-manifesto/

"It is common to misconceive how checklists function in complex lines of work. They are not comprehensive how-to guides, whether for building a skyscraper or getting a plane out of trouble. They are quick and simple tools aimed to buttress the skills of expert professionals." - Gawande, Atul. The Checklist Manifesto
--->

### Quality

- [ ] Confirmed

1. For the code that this change impacts, I believe that the automated tests validate functionality that is highly important to users. If the existing automated tests do not cover this functionality, I have added the necessary additional tests or I have added an issue to describe the automation testing gap and linked it to this MR.
1. I have made sure that the sonar quality coverage is up to standards.
1. I have considered the impact of this change on the front-end, back-end, and database portions of the system where appropriate and applied.
1. I have tested this MR in all supported browsers or determined that this testing is not needed.
1. I have confirmed that this change is backwards compatible across updates (migrate up needs a migrate down), or I have decided that this does not apply.

### Performance, reliability and availability

- [ ] Confirmed

1. I am confident that this MR does not harm performance, or I have asked a reviewer to help assess the performance impact.
1. I have considered the scalability risk based on future predicted growth.

### Documentation

- [ ] Confirmed

1. I have prepared a squash commit to feed the changelog linked to the current milestone.
1. I have added/updated documentation (also updated if the changes feature a deprecation) or I have decided that documentation changes are not needed for this MR.

### Security

- [ ] Confirmed

1. I have confirmed that if this MR does not contains any sensitive informations hidden in the changes.

### Deployment

- [ ] Confirmed

1. When featured on a self-data project release, i have made sure my app version in the manifest and package.json is incremented and any relative changes to the permissions are clearly written and transmitted to Cozy.
