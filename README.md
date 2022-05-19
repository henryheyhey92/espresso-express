# Espresso Express RESTFUL API and HBS, Project - 02

This is the Next-Flavour project built with Express.js. and MongoDB for Project 2. 
The front-end react project can be found [https://github.com/henryheyhey92/next-flavour](https://github.com/henryheyhey92/next-flavour)

# Index

1. [Context](#1-context)
2. [Document Design](#2-Database-document-design)
3. [Technologies Used](#3-technologies-used)
4. [Acknowledgements](#4-acknowledgements)

# 1. Context

This is a custom API built for the [https://next-flavour-coffee.netlify.app/](https://next-flavour-coffee.netlify.app/) project (The project application link). The project is for purpose of learning building a ecommerce site as well as for personal interest. The application is built with [MySql](https://www.mysql.com/) and [Express.js](https://expressjs.com/) 



# 2. Database document design


The database has total of 12 tables. The RESTFUL api are written and located in the routes folder directory. The CRUD operation is supported only in the users, product, orders, carts. There are different level of access for the application. Shop owners can access all features (can reset users information), manager can access the carts, products and orders ,and normal users can only access the product page and carts. 

The email and access password is noted on the landing page of the application. You will be able to see it once you lauch the heroku application.

here is the link for the backend appplication
Link: [https://hl-espresso.herokuapp.com/](https://hl-espresso.herokuapp.com/)


# 3. Technologies Used


- [Express.js](https://expressjs.com/)

    For the purpose of API building in this project


-[Bookshelf](https://bookshelfjs.org/) Javascript ORM for Nodejs

- [MySql](https://www.mysql.com/) For database 

-[Cloudinary](https://cloudinary.com/) for upload images

# 4. Acknowledgements

stackoverflow community and Paul's tutorials code and friends who have helped on the development of the project.


And also to thank COde Institute for the student template for gitpod



