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
### 3) /GameState
Rotta per ottenere lo stato di una partita; anche in questo caso è necessario specificare come parametro l'id della partita /:id/state. La rotta restituisce diverse informazioni come la tipologia della partita, lo stato (conclusa o aperta), l'eventuale vincitore e l'attuale utente che deve eseguire un' attacco.
### 4) /GameHistory
Rotta per ottenere in formato CSV l'ordine delle mosse eseguite in una partita. Per ogni riga si avranno le coordinate dell'attacco, l'utente che lo ha eseguito ed un campo booleano "hashitted" che indica se l'utente ha colpito o meno una nave avversaria. Nel caso di partita in modalità silence se quest'ultima mossa è stata eseguita il campo hashitted avrà un valore *silence* che sarà sostituito una volta che la partita si sarà conclusa. 
Anche in questo caso è necessario specificsre l'id della partita nella rotta /:id/history.

### 5) /ChargeUser
Rotta (/charge) che permette ad un utente con ruolo admin di eseguire una ricarica di token ad un utente. Il middleware controlla sia che chi esegue la richiesta abbia un ruolo admin, sia che l'utente selezionato esista nel database. 

Il payload deve essere inserito nel body della richiesta in formato JSON secondo questa struttura:
 ```
{
    "destination_user": "usernotokens@mail.it",
    "value": 1
}
```