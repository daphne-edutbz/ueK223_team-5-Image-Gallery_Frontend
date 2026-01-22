# OurSpace – Image Gallery (üK 223)

## Voraussetzungen

## Backend starten
**Docker mit PostgreSQL (Port 5432) muss laufen**

```powershell
cd ueK223_team-5-Image-Gallery_Backend
.\gradlew bootRun
```

Backend läuft unter:

http://localhost:8080/

Swagger UI:

http://localhost:8080/swagger-ui/index.html#/


## Frontend starten
**Backend & Docker müssen bereits laufen**


``` powershell
cd ueK223_team-5-Image-Gallery_Frontend
yarn install
yarn dev
```

Frontend läuft über: http://localhost:3000/

## Login Daten und Rollen

Alle Test-User haben das Passwort: `1234`

| Rolle     | E-Mail                                                        | Beschreibung                  |
| --------- | ------------------------------------------------------------- | ----------------------------- |
| **Admin** | [admin@example.com](mailto:admin@example.com)                 | Admin mit erweiterten Rechten |
| **User**  | [olivia.parker@example.com](mailto:olivia.parker@example.com) | Normaler eingeloggter User    |
| User      | [daniel.brooks@example.com](mailto:daniel.brooks@example.com) | Normaler User                 |
| User      | [mia.wallace@example.com](mailto:mia.wallace@example.com)     | Normaler User                 |
| User      | [emma.wilson@example.com](mailto:emma.wilson@example.com)     | Normaler User                 |


## Tests ausführen
### Cypress
folgendes im Fronted ausführen:`yarn cypress run`
---
### Postman-Tests

Es wurden **32 Postman-Tests** erstellt, um sicherzustellen, dass die Applikation korrekt funktioniert.

Getestet wurden dabei:
- **Gültige Request-Flows** (Happy Paths)  
- **Fehlerfälle** (Exceptions)  
- **Rollen- und Berechtigungsprüfungen**

Alle Tests sollten erfolgreich durchlaufen.

### Import der Postman-Tests

Die exportierten Postman-Tests befinden sich im Backend-Projekt im Ordner `Postman`.  

Enthalten ist eine **JSON-Datei**, die Folgendes beinhaltet:
- Collections  
- Environments  
- Variablen  
- Authentifizierung

**Anleitung zum Import:**  
1. Postman öffnen  
2. Auf **Import** klicken  
3. Die JSON-Datei auswählen und importieren  

Es sind **keine weiteren Konfigurationen notwendig**.

![OurSpace Image Gallery](https://github.com/user-attachments/assets/4df950f0-368c-40d2-8562-bc9b85dbcb54)

## Frontend-URLs & gruppenspezifische Funktionalitäten

### Öffentliche Seiten

| URL      | Beschreibung         |
| -------- | -------------------- |
| `/`      | Öffentliche Homepage |
| `/login` | Login-Seite          |


### Eingeloggte User (ROLE_USER)
| URL                 | Funktion                                             |
| ------------------- | ---------------------------------------------------- |
| `/gallery`          | Image Gallery anzeigen (Pagination, Likes)           |
| `/gallery/my-posts` | Eigene Image-Posts erstellen, bearbeiten und löschen |



### Admin (ROLE_ADMIN)
| URL                  | Funktion                                 |
| -------------------- | ---------------------------------------- |
| `/gallery`     | Alle Image-Posts bearbeiten oder löschen |
| `/user`     | Alle Users bearbeiten oder löschen. Neuen User erstellen |










