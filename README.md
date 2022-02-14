# Axie Part Recognition Model

This project is developed to identify Axie Parts (from a game called Axie Infinity) and its corresponding cards with the use of **YOLOv5**, **Tensorflow** and **React Native**.

## Tools Used

- 💠 **YoloV5** - Used for training a custom model based on their respective pre-trained models.
- 💠 **TensorflowJS** - Used for deploying the model through a web application.
- 💠 **React Native** - Used as a front-end and creation of a web application.
- 💠 **labelImg** - A python program used for annotating and labeling classes from the given images. View the respective repo here: (https://github.com/tzutalin/labelImg)

## Features

- 💠 **Drag / Upload Image** - You can simply drag and upload the images that you want to detect from, afterwards it will display the accuracy and the detected class or part.
- 💠 **Realtime Detection** - In some stances, the browser will require you to allow the usage of your camera. After enabling, the model will be able to detect the Axie Parts including the detected classes and accuracy in realtime.
- 💠 **Card Display** - The model will also show the associated card to the detected part. Applies to Upload and Realtime detection.

## Disclaimer

Although the project or model is complete, the weights used for the project is not ***fine-tuned*** and can still be improved. The model usually suffers from Realtime Detection due to its low accuracy, yet the model can still detect the parts properly. Worst case scenario, there will false positives in which the model will detect parts from your background or environment.

## Copyright

Developers:

- **Vann Chezter Lizan**, Technological University of the Philippines (vannchezterl@gmail.com)
- **Franco De Guzman**, Technological University of the Philippines (tangkekofranco06@gmail.com)
- **Lance Kian Lejano**, Technological University of the Philippines (?)
