The source code for FaST-MOSA is available at the [Multi-sided Fairness in Sequential Task Assignment](https://github.com/4nnina/fair_seq_task_assignment.git) repository.


⚠️ It is necessary to copy the 📄 `utils.py` file, 📁 `global_sol` and 📁 `local_sol` folders **here**.

⚠️ Once copied, replace rows from 12 to 16 in 📄 `local_sol/data_classes_local.py` with the following code:

```bash
current_dir = os.getcwd()
parent_dir = os.path.join(current_dir, "FAST")
src_dir = os.path.join(parent_dir, "src")
dataset_path = os.path.join(parent_dir, "dataset")  
```