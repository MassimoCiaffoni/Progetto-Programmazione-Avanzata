# Progetto-Programmazione-Avanzata: Battleship Game
## Obiettivi del Progetto
L'obiettivo del progetto consiste nella realizzazione di un backend che consente di gestire il gioco della battaglia navale. Il sistema prevede la possibilità di far interagire due utenti (autenticati mediante JWT) o un utente contro l’elaboratore. Ci possono essere più partite attive in un dato momento. Un utente può allo stesso tempo partecipare ad una ed una sola partita. Si può giocare la partita anche in una modalità alternativa (solo nel caso di utente contro utente); si utilizza a tal proposito un parametro silence che corrisponde alla facoltà da parte di un utente di non rispondere se la cella è piena o vuota (silenzio). Tale parametro può avere un valore compreso tra 0 e 5 (estremi inclusi). Ogni volta che un utente esercita tale opzione durante la partita il valore di silence viene decrementato. Se uguale a zero il sistema deve negare la possibilità all’utente di esercitare l’opzione silenzio e viene restituito lo stato della cella (vuoto o pieno). Se l’opzione silenzio è esercitabile allora si registra la mossa ma non viene comunicato lo stato (vuoto o pieno) fino al termine della partita. Per ogni partita viene addebitato un numero di token in accordo con quanto segue:

- § 0.35 all’atto della creazione.

- § 0.015 per ogni mossa da parte degli utenti (anche IA).

Il modello può essere creato se c’è credito sufficiente ad esaudire la richiesta (se il credito durante la partita scende sotto lo zero si può continuare comunque).
In particolare, il sistema ha lo scopo di implementare le seguenti funzionalità. Prevedere infine una rotta per l’utente con ruolo admin che consenta di effettuare la ricarica per un utente fornendo la mail ed il nuovo “credito” (sempre mediante JWT).

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
