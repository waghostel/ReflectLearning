# Reflective learning system



I would like to build a learning app to help people learn better by reading, taking lecture, and reflection. The name of this app is called ReflectLearning. User upload one or more documents(PDF, text, or image), this app will first convert the content into a reading material, which is a markdown file being rendered as a page with multiple chapter. The markdown(reading material) file is editable. User can click on a button and edit the specific chapter in markdown format. It is possible to display image, table or other common markdown file support notations. In the lecture mode, the AI guide will render a slide to teach user for specific concepts. A numerious topics was generated and list.

Please help me to create the pages below: Entry page, reading page, knowledge map page, reflection page.



## Pages:

[Entry page]

The entry page provide the entry to all the important page(File upload, reading, lecturing, reflection). It will gray out reading, lecturing,reflection card and let user can only upload file when there is no content being upload. 

[File upload page/material upload page]

A popout window, user can upload file, image, paste texts, provide url or just type the learning goal into a text box and let LLM to search related material for them.

Design with a file upload ui where user can easily drag and drop multiple files into a box or pop out a multiple file selection gui for user to select multiple files. 

The upload file will be list in a file list with v to tell user the file have been uploaded completed. User can see the progress bar and percentage during the uploading process. The upload file can also be deleted after clicking on the x.



[Reading page]

User can read the material rewrite from both the material provided by user and content being search from the internet. Picture, tables  and other markdown format support notations can be display in the reading page. The reading material have multiple chapters. Once user click on an edit button, it will enter into the markdown edit mode for spcific chapter, user can them modify the markdown file accordingly. The content reading material(chapter or sub chapter) can growth when user ask questions in mostly two way: 1. Insert a new paragraph, chapter or few sentences. 2. Insert into a Q&A session. There is also 



[Knowledge map page]

It is a grid like structure, looks like a heat map, within each grid, it label a knowledge point,the knowledge point can  a specific keyword, which displays the knowledge points as a grid where the center is the topic or suptopic of the knowledge. The color is the user understanding of the knowledge. When click on specific know point, user can further jump into the reading page, lecture page or reflection page. User can then  start form that knowledge point to learn. The heat map display how often user interact with specific knowledge point. Also how familiar user understanding specific knowledge point.



[Lecture page]

User can take lecture teaching by AI teacher. The lecture page looks like slide surround by numerious topics. The content is rendered from the markdown format with text, picture,table… being inserted. For each topics, there may be numerious subtopics. User can click on the button to switch between slide pages or from an outline.



[Reflection page]

The reflection page is being use to help the user recall and text their understanding of the knowledge. In the reflection page, user can see the slide display. The AI teacher will display text, image as hint, and start to ask questions(vocal or through slide/chatbox) related to the reading and lecture material. AI teacher will generated reflection material based on the learning material and how user understands the topics. User can answer question by vocal, typing or ticking on multiple choice. The process is more like a tutor writing something on the paper(slide) and ask the student question about it then letting the student to answer. If the student cannot answer, ai teacher will try to provide some hint to guide the student get the correct answer. Student can still give up and ask the AI teacher to teach the specific topic again or skip specific topics(subtopics) if they are not interested in. It can be follow a process to test multiple topics or random generated. 



## Reading material creation

After user upload related content or type the topics they want to learn, LLM will start to process the contents. It can also search the internet to enrich the content. User can switch on and off the search feature by a toggle button.



## Slide creation

It is an instant render from for specific topic or subtopic based on the need. There will be a pre-defined slide series, however, user can ask to change the process. Make it a learning journey defined by user. Both Lecture page and reflection page will be an instant render slide with AI teacher teaching with vocal or typing text(when user is in an environment which need to be silent or they prefer not to talk). The content of each slide is render from the topics and topic related contents being created directly. We prefer to render the slide with Marp(which is a npm package that can create slide directly from markdown. AI can search related information and instantly render the material into slides. 



## Learning journey

User can start from reading, lecturing or directly entering to reflection after the topic have been defined or the study material have been uploaded.



## File download feature

The reading material, create slide on lecture page and reflection page can be saved and download as html, pdf or other marp support format. 



Data processing logics

1. User upload related material

2. Create reading material: Process the reading material: material into a markdown file(reading material) with picture, table…etc.

3. Create topics and subtopics: Process the reading material into topics and sub topics with their own contents.

4. Create slides and talk to user: when user enter into lecture mode or reflection mode, the AI agent will start to teach or ask question about specific topic or subtopics.



## User understanding capture

During the interaction with LLM, the AI agent will record what user knows and don’t knows in a text file as memory. Also the heat map value will also be modified by LLM based on user’s understanding. 



## knowledge point

Knowledge point can be keyword, topic subtopic. It is being used to link to specific reading material, lecture topic or reflection topics. It can also be used to record how user understand or interesting in specific topics. It is not a defined number. When user interact with the system it can add more knowledge points into it.