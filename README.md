<div align="center">

  <h1>🎯 FAST Thesis Project</h1>

  ![Version](https://img.shields.io/badge/Version-0.1.0-blue)
  ![License](https://img.shields.io/badge/License-MIT-green)
  ![Python](https://img.shields.io/badge/Python-3.10+-blue)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.120+-green)
  ![React](https://img.shields.io/badge/React-19.2+-blue)
  ![Nodejs](https://img.shields.io/badge/NodeJs-20.19+-green)

</div><br>

**Welcome to this project**, an application created using **Python** (backend) and **TypeScript** (frontend) to manage and run the **FAST** algorithm (Multi-sided Fairness in Sequential Task Assignment) (repo <a href="https://github.com/4nnina/fair_seq_task_assignment">HERE</a>). <br>
My task was to improve the graphics of the previous software, enrich the backend (and document it), and introduce the possibility of having the results explained by an LLM (**explanation AI**).<br><br>

A basic user (a **University of Verona professor**) who accesses the software can:
* change their time preferences, deciding which weekly timeslots to mark as *available*, *better not*, or *impossible*.
<br>

The **administrator** who accesses the software can:

* change the information of a basic user (such as name, password, maximum number of *better not* and *impossible* slots that can be used);
* change the time preferences of a basic user as desired;
* download all constraints of all users in CSV format;
* start the FAST algorithm while monitoring its progress during the iterations;
* request AI assistance at any moment during the execution of the algorithm to obtain an overview of the situation, interpret the resulting data, understand why the optimal schedule is (almost) never achievable, and obtain possible ways to improve the schedule as much as possible.
<br>


## 📦 Installation & Setup (only Linux-based systems)

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
   source venv/bin/activate                 
   ```

   _Installing the libraries_
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   _Setupping environment variables_

   ```bash
   cp .env.example .env                     
   nano .env                                 # modify env variables with yours
   rm .env.example                           # now It's useless
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

4. **Integrate the FAST algorithm into the backend** <br>

To complete the setup, you must perform the steps indicated in `backend/FAST/dataset/README.md` and `backend/FAST/src/README.md`. <br><br>


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

   <a href="http://127.0.0.1:5000"> ``` http://127.0.0.1:5000 ``` </a>

5. **Open the following link to get to the final application**

   ```bash
   http://127.0.0.1:{FRONTEND_PORT}              # FRONTEND_PORT = value from variable in 'frontend/run.sh'
   ```
   Default port is 8000, so then: <a href="http://127.0.0.1:8000"> ``` http://127.0.0.1:8000 ``` </a><br>

6. **Log in as base user or admin**

   Currently, these dummy credentials are set in `backend/database/db.sqlite3`.

   | Username | Password |
   |------|-----|
   | admin | pallone |
   | prof1  | ciaone |
   | prof2  | ciaone |
   | ...  | ciaone |
   | prof111  | ciaone |
   | prof112  | ciaone |

<br>

## 📌 Credits

* Previous thesis project (by Andrea Rosa): <a href="https://github.com/4nnina/FAST-UI">https://github.com/4nnina/FAST-UI</a><br>
* FAST algorithm (by Anna Dalla Vecchia): <a href="https://github.com/4nnina/fair_seq_task_assignment">https://github.com/4nnina/fair_seq_task_assignment</a>
<br><br>

