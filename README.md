# Progetto-Programmazione-Avanzata: Battleship Game
## Obiettivi del Progetto
L'obiettivo del progetto consiste nella realizzazione di un backend che consente di gestire il gioco della battaglia navale. Il sistema prevede la possibilità di far interagire due utenti (autenticati mediante JWT) o un utente contro l’elaboratore. Ci possono essere più partite attive in un dato momento. Un utente può allo stesso tempo partecipare ad una ed una sola partita. Si può giocare la partita anche in una modalità alternativa (solo nel caso di utente contro utente); si utilizza a tal proposito un parametro silence che corrisponde alla facoltà da parte di un utente di non rispondere se la cella è piena o vuota (silenzio). Tale parametro può avere un valore compreso tra 0 e 5 (estremi inclusi). Ogni volta che un utente esercita tale opzione durante la partita il valore di silence viene decrementato. Se uguale a zero il sistema deve negare la possibilità all’utente di esercitare l’opzione silenzio. Se l’opzione silenzio è esercitabile allora si registra la mossa ma non viene comunicato lo stato (vuoto o pieno) fino al termine della partita. Per ogni partita viene addebitato un numero di token in accordo con quanto segue:

- § 0.35 all’atto della creazione.

- § 0.015 per ogni mossa da parte degli utenti (anche IA).

Il modello può essere creato se c’è credito sufficiente ad esaudire la richiesta (se il credito durante la partita scende sotto lo zero si può continuare comunque). Prevedere infine una rotta per l’utente con ruolo admin che consenta di effettuare la ricarica per un utente fornendo la mail ed il nuovo “credito” (sempre mediante JWT).

Le funzionalità da sviluppare sono riassunte nella seguente tabella:

|     Funzionalità  | Ruolo |
| ------------- | ------------- |
| Creare una nuova partita  | user/admin |
| Eseguire una nuova mossa in una partita  |  user/admin |
| Visualizza lo stato di una partita  | user/admin |
| Visualizza lo storico delle mosse in formato CSV | user/admin  |
| Ricarica token all'utente  | admin  |

## Diagrammi UML
### Diagrammi dei casi d'uso
![use_case_diagram](images/UseCases.png)
### Diagrammi delle sequenze
#### Creare una nuova partita
![CreateGame](images/1.CreateGame.png)
#### Eseguire una nuova mossa in una partita
![Attack](images/2.Attack.png)
#### Visualizza lo stato di una partita
![GameState](images/3.GameState.png)
#### Visualizza storico delle mosse in una partita
![GameHistory](images/4.GameHistory.png)
#### Ricarica token all'utente
![ChargeUser](images/5.ChargeUser.png)

## Richieste
|Rotta| Tipo |Ruolo| Autenticazione JWT	|
| ------------- | ------------- |------------- | ------------- |
| /CreateGame | POST |	admin/user | sì |
| /Attack | POST | admin/user | sì |
| /GameState | GET |	admin/user | sì |
| /GameHistory | GET | admin/user | sì |
| /ChargeUser | POST |	admin | sì |

## Descrizione delle rotte
Nel seguente paragrafo sono descritte tutte le rotte realizzate nel progetto. Tutti i raw data inviati dall'utente vengono validati nel middleware controllando i relativi tipi e le relazioni che intercorrono tra di essi (ad esempio un utente che richiede di creare un nuovo gioco deve possedere almeno 0.35 token). Inoltre, si controlla la presenza o meno di certi dati nel database PostgreSQL ove necessario (ad esempio se l'utente che esegue una richiesta e/o l'opponent descritti sono utenti esistenti nel database).

### 1) /CrateGame
Rotta (/creategame) per aggiungere una nuova partita nel database con i relativi dati, ossia il tipo di gioco (multiplayer o singleplayer), l'avversario, la modalità silence ed il relativo numero di mosse silence (da 0 a 5), la lunghezza del tabellone e un array di navi da posizionare in maniera casuale. Il middleware in questo caso confronta sia i tipi dei valori del body sia la relazione tra di essi (ad esempio in caso di partita di tipo singleplayer non è possibile specificare un avversario diversa da AI o la modalità silence). 

Il payload deve essere inserito nel body della richiesta in formato JSON secondo questa struttura:
 ```
{   
    "game_type": "multiplayer",
    "silent_mode": false,
    "opponent" : "opponent@mail.it",
    "grid_size" : 4,
    "silences" : 0,
    "ships" : [
        {
            "size": 3
        },
        {
            "size": 1
        },
        {
            "size": 2
        }

    ]
}
```
Token JWT valido (user adriano):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImVtYWlsIjoiYWRyaWFub21hbmNpbmlAbWFpbC5pdCIsImlhdCI6MTUxNjIzOTAyMn0.eX5x1ww9oakJyexsd87nptnrXM6OsLZIv2UhciCtwZo
```
E' possibile fare un test utilizzando anche un utente con un numero insufficente di token (in questo caso la partita non sarà creata) con il seguente JWT (usernotoken):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJub3Rva2Vuc0BtYWlsLml0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.TXmtV03YhELXnmxoKjISd9maiDWI68vfjvKAmSAX2Is
```

### 2) /Attack
Rotta per eseguire una nuova mossa in una partita. La rotta prende come parametro l'id della partita /:id/attack e i relativi dati come le coordinate dell'attacco e la possibilità di eseguire se possibile (il middleware controlla sia se la modalità è attiva per quella partita sia se il numero di mosse non sia pari a 0) la mossa silence. Ogni volta che un utente esegue una mossa il controller assegna il turno all'avversario una volta che questa si è conclusa. 

Il payload deve essere inserito nel body della richiesta in formato JSON secondo questa struttura:
 ```
{
    "x": 1,
    "y": 1,
    "silence": false
}
```
Token JWT validi (user adriano e user opponent)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImVtYWlsIjoiYWRyaWFub21hbmNpbmlAbWFpbC5pdCIsImlhdCI6MTUxNjIzOTAyMn0.eX5x1ww9oakJyexsd87nptnrXM6OsLZIv2UhciCtwZo
```
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9wcG9uZW50QG1haWwuaXQiLCJyb2xlIjoidXNlciIsImlhdCI6MTUxNjIzOTAyMn0.CkTHR85n_pS2AJgK2GTBEn28zNUIeOph487muesEjMc
```
### 3) /GameState
Rotta per ottenere lo stato di una partita; anche in questo caso è necessario specificare come parametro l'id della partita /:id/state. La rotta restituisce diverse informazioni come la tipologia della partita, lo stato (conclusa o aperta), l'eventuale vincitore e l'attuale utente che deve eseguire un' attacco.

Token JWT valido (user adriano):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImVtYWlsIjoiYWRyaWFub21hbmNpbmlAbWFpbC5pdCIsImlhdCI6MTUxNjIzOTAyMn0.eX5x1ww9oakJyexsd87nptnrXM6OsLZIv2UhciCtwZo
```
### 4) /GameHistory
Rotta per ottenere in formato CSV l'ordine delle mosse eseguite in una partita. Per ogni riga si avranno le coordinate dell'attacco, l'utente che lo ha eseguito ed un campo booleano "hashitted" che indica se l'utente ha colpito o meno una nave avversaria. Nel caso di partita in modalità silence se quest'ultima mossa è stata eseguita il campo hashitted avrà un valore *silence* che sarà sostituito una volta che la partita si sarà conclusa. 
Anche in questo caso è necessario specificsre l'id della partita nella rotta /:id/history.

Token JWT valido (user adriano):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImVtYWlsIjoiYWRyaWFub21hbmNpbmlAbWFpbC5pdCIsImlhdCI6MTUxNjIzOTAyMn0.eX5x1ww9oakJyexsd87nptnrXM6OsLZIv2UhciCtwZo
```

### 5) /ChargeUser
Rotta (/charge) che permette ad un utente con ruolo admin di eseguire una ricarica di token ad un utente. Il middleware controlla sia che chi esegue la richiesta abbia un ruolo admin, sia che l'utente selezionato esista nel database. 

Il payload deve essere inserito nel body della richiesta in formato JSON secondo questa struttura:
 ```
{
    "destination_user": "usernotokens@mail.it",
    "value": 1
}
```

Token JWT valido (admin):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6Im1hc3NpbW9jaWFmZm9uaUBtYWlsLml0IiwiaWF0IjoxNTE2MjM5MDIyfQ.EUJ0StYY9eRmsGe1O6lRTU7n80ZHpHwlIcVAA-ORzDQ
```

## Pattern Utilizzati 
### Singleton
Il Singleton è un design pattern creazionale che assicura di realizzare un'unica istanza di una certa classe, garantendo però l'accesso globale ad quella determinata istanza.
Il costruttore di default è privato, per prevenire l'uso dell'operatore "New" associato alla classe Singleton.
In questa classe si definisce un metodo statico che funge da costruttore: quando richiamato l'oggetto verrà creato solamente in assenza di un'ulteriore istanza.
Questo pattern è stato utilizzato per realizzare la connessione al database al fine di garantirne l'unicità, in questo modo infatti le risorse utilizzate dal sistema sono minori in quanto non sono aperte molteplici connessioni. 
### DAO
Il Data Access Object è un pattern architetturale utile per l'astrazione dei dati persistenti.
Il DAO permette di isolare lo strato della logica di applicazione dallo strato di persistenza dei dati tramite un meccanismo di astrazione.
Questa interfaccia nasconde all'applicazione la complessità delle operazioni CRUD del sottostante meccanismo di storage, permettendo ad entrambi gli strati di evolvere separatamente senza conoscere nulla l'uno dell'altro.
Disaccoppiare lo strato di logica dallo strato dei dati persitenti permette di essere molto più flessibili nella scelta del meccanismo di storage, il quale potrà facilmente essere cambiato in futuro.
Il pattern è stato utilizzato per rendere l' applicazione più flessibile e manutenibile nel tempo. 
### Model - Controller
Il pattern architetturale comunemente conosciuto è il Model View Controller: poichè le specifiche del progetto si concentrano sullo sviluppo di un back-end, la componente di View non può essere implementata.
Utilizzando questo pattern il sistema è stato suddiviso in due componenti logiche in grado di interagire tra di loro.
Il componente Model gestisce i dati e le operazioni su quest'ultimi, mentre il Controller gestisce l'interazione con l'utente.

### Chain of Responsability
La Chain of Responsability è un design pattern comportamentale che permette di far passare la richiesta lungo una catena di handlers.
Ogni handler prende la richiesta come argomento ed ha un riferimento all'handler successivo: se il controllo non va a buon fine l'handler restituirà un errore, altrimenti passerà la richiesta all'handler seguente. 
Nel caso in cui la richiesta riesca a passare tutti i controlli della catena, essa sarà passata infine al controller. 
E' necessario implementare un pattern di questo tipo poichè al crescere della complessità dell'applicazione, maggiori sono i controlli che devono esser fatti sulle richieste e dunque il codice risulterebbe confusionario e duplicato senza un' adeguato meccanisco di handler in serie.

### Factory Method
Il Factory Method è un design pattern creazionale che fornisce un'interfaccia per la creazione di oggetti in una super classe, ma permette alle sottoclassi di alterare il tipo di oggetti che saranno creati. Si usa quindi l'interfaccia per istanziare oggetti diversi. Il pattern è stato utilizzato per la generazione dei messaggi di errore e di successo da ritornare al client.

## Avvio del progetto
Per poter eseguire il progetto è necessario avere installato [Docker](https://www.docker.com) sulla propria macchina.

Per procedere con l'esecuzione del progetto effettuare i seguenti passaggi:
- Clonare la repository di progetto
 ```
git clone https://github.com/MassimoCiaffoni/Progetto-Programmazione-Avanzata
```
- Creare un file ".env" all'interno della directory di progetto con i seguenti dati:
 ```
SECRET_KEY=secretkey
PGUSER=postgres
PGDATABASE=battleship
PGPASSWORD=postgres
PGHOST=dbpg
PGPORT=5432
```
- Da terminale posizionarsi nella directory clonata
```
cd https://github.com/MassimoCiaffoni/Progetto-Programmazione-Avanzata
 ```
 - Avviare i servizi tramite Docker con i seguenti comandi:
 ```
 docker-compose build
 docker-compose up
 ```

 ## Test
Per l'esecuzione dei test è necessario importare il file [Battleship.postman_collection.json](Battleship.postman_collection.json) nel programma [Postman](https://www.postman.com).
Ricordo che per eseguire il test dell'attacco è necessario ogni volta inserire il token JWT dell'utente attualmente in turno (per velocizzare è auspicabile inserire i token JWT degli utenti nell'enviroment di postman).

I token JWT utilizzati per i test sono stati generati utilizzando  [JWT.IO](https://jwt.io/) con la chiave _secretkey_.


## Librerie/Framework
 - [Node.JS ](https://nodejs.org/en/)
 - [Express](https://expressjs.com)
 - [Sequelize](https://sequelize.org)
 - [Postgres](https://www.postgresql.org)


## Autori

 - [Ciaffoni Massimo ](https://github.com/MassimoCiaffoni)
