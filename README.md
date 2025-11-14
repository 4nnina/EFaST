<div align="center">

  <h1>🎯 FAST Thesis Project</h1>

  ![Version](https://img.shields.io/badge/Version-0.1.0-blue)
  ![License](https://img.shields.io/badge/License-MIT-green)
  ![Python](https://img.shields.io/badge/Python-3.10+-blue)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.120+-green)
  ![React](https://img.shields.io/badge/React-19.2+-blue)
  ![Nodejs](https://img.shields.io/badge/NodeJs-20.19+-green)

</div><br>

  Welcome to the FAST Project — a research‑oriented software system combining Python and Node.js (Typescript) to manage and execute the FAST algorithm (repo <a href="https://github.com/4nnina/fair_seq_task_assignment">HERE</a>). <br> This project is created in order to (... future description ...) for a bachelor degree thesis in computer science by Fortunato Alessandro at University Of Verona. <br><br>


## 📦 Installation & Setup

1. **Clone and go into the repository**
   ```bash
   git clone https://github.com/Fortu032/FAST_thesis.git
   cd FAST_thesis
   ```

2. **Set up the Python backend environment**

  _Creating & joining the backend virtual environment_
   ```bash
   cd backend
   python3 -m venv venv                     
   source venv/bin/activate                 # On Windows: venv\Scripts\activate
   ```

   _Installing the libraries_
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   _Setupping environment variables_

   ```bash
   cp .env.example .env                     
   nano .env                                 # Modify with your favorite values
   rm .env.example                           # Now It's useless
   ```

  _Quitting the backend virtual environment_

  ```bash
   deactivate
   ```

3. **Set up the NodeJs frontend environment**

   ```bash
   cd ../frontend
   npm install
   ```
   <br><br>

## 🚀 Running the Application

1. **Open two different terminal and move both into the main dir**

    ```bash
   cd FAST_thesis
   ```

2. **Go into the backend dir and start the server (1st terminal)**

   ```bash
   cd backend
   ./run.sh
   ```

3. **Go into the frontend dir and start the client (2nd terminal)**

   ```bash
   cd frontend
   ./run.sh
   ```

4. **Open the following link to see the backend server documentation (optional)**

   ```bash
   http://127.0.0.1:{FASTAPI_PORT}                # FASTAPI_PORT = value from variable in .env
   ```

5. **Open the following link to get to the final application**

   ```bash
   http://127.0.0.1:{VITE_PORT}              # VITE_PORT = value from variable in 'frontend/run.sh'
   ```
   Default port is 8000, so then: <a href="http://127.0.0.1:8000"> ``` http://127.0.0.1:8000 ``` </a><br><br>

## 📁 Project Structure

```
.
├── backend
│   ├── database
│   │   ├── db.sqlite3                    # example db (already populated with fake data) 
│   │   └── manager.py                    # classes for query management and db scheme
│   ├── .env.example                   # example format for .env file
│   ├── FAST                  # FAST algorithm directory (* see below)
│   │   └── ...
│   ├── index.html                  # main template to render 
│   ├── logs                  # backend logging configuration and collector
│   │   └── ...                  
│   ├── main.py                     # entry point for the backend, routes collection
│   ├── model.py                    # classes for data management
│   ├── requirements.txt                  # needed python libraries
│   └── run.sh                  # backend starter
├── frontend
│   ├── public                   # static files 
│   │   └── ...
│   ├── assets                   # available files for react
│   │   └── ...
│   ├── README.md                   # this file
│   ├── run.sh                   # frontend starter
│   ├── src
│   │   ├── App.tsx                 # application global component
│   │   ├── components                    # components used by the pages
│   │   │   └── ...
│   │   ├── main.tsx                   # entry point for the application
│   │   ├── pages                   # main pages of the frontend
│   │   │   └── ...
│   │   ├── services                # API services 
│   │   │   └── ...
│   │   └── types                   # typescript type interfaces
│   │       └── ...
│   └── ...
└── LICENSE.txt                  # license
```

(*) This directory contains the folders `src/` and `dataset/`, taken from <a href="https://github.com/4nnina/fair_seq_task_assignment">the FAST repo</a>. The file `src/main.py` comes from the previous thesis project. <br><br>

## 📌 Credits

Previous thesis project (by Andrea Rosa): <a href="https://github.com/4nnina/FAST-UI">https://github.com/4nnina/FAST-UI</a><br><br>

---

Project is not done yet. <br><br>
