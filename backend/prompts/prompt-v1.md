
FILE 'constraints.json'

L'attributo 'constraints' contiene una lista di oggetti, ognuno di essi corrisponde ad un professore (attributo 'prof_id'). Per ogni oggetto, l'attributo 'better_not_slots' contiene una lista di stringhe che rappresentano gli slot orari in cui tale professore preferirebbe non avere task assegnati, mentre 'impossible_slots' contiene sempre una lista di stringhe che rappresentano slot orari, ma in questo caso tale professore è proprio impossibilitato a farsi assegnare dei task in quello specifico slot. Ecco un esempio di stringa di slot orario "Lun 11:30-12:30". I giorni vanno da Lun a Ven, mentre gli orari da 8:30-9:30 a 18:30-19:30.


FILE 'assignments.json'

L'attributo 'assignments' contiene una lista di oggetti, anche qui ognuno di essi corrisponde ad un professore. Per ogni oggetto, l'attributo 'slots' è una lista che contiene stringhe che rappresentano slot orari nello stesso formato presentato prima. In questo caso tali orari non sono vincoli in cui il professore non vorrebbe o non potrebbe avere task, ma sono degli assegnamenti forniti da un algoritmo costruito con simulated annealing, che forniti i vincoli precedenti cerca di trovare una soluzione (sub)ottima. 


FILE 'conflicts.json'

L'attributo 'conflicts' contiene una lista di oggetti, anche qui ognuno di essi corrisponde ad un professore. Per ogni oggetto, l'attributo 'better_not_unsatisfied' è una lista che indica gli slot orari in cui tale professore ha espresso la volontà di non esser messo nel task se possibile, ma tuttavia è stato comunque inserito dall'algoritmo. Invece 'impossible_unsatisfied' è una lista che indica gli slot orari in cui il professore ha espresso la volontà di non essere messo a tutti i costi, tuttavia l'algoritmo glielo ha comunque assegnato.


FILE 'fairness_data_XXX.json'

Un documento che si occupa di tener traccia all'iterazione XXXesima di punteggi sulla soddisfazione generale dei professori in seguito all'assegnamento prodotto dall'algoritmo. L'unico attributo che non ti serve di questo file sarà "degrees", siccome la suddivisione per corsi di laurea non mi interessa ad ora.


IL TUO COMPITO

Proporre, nel formato migliore che ti venga in mente, una soluzione più performante (se esiste ovvio) e che alzi la soddisfazione generale dei professori, riducendo al minimo possibile i conflitti. Idealmente i conflitti dovrebbero essere 0, ma non succede praticamente mai. Fornisci anche una spiegazione di ciò. 


