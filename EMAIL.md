# Invio delle mail

L'invio delle mail è stato ora disabilitato ma i passi per poter riattivarlo sono:
- Configurare nei file d'ambiente (del BackEnd) i campi EMAIL e PSW_EMAIL per l'accesso da parte del BackEnd
- Nell'account gmail, disabilitare il "Less Secure App" seguendo questa [guida](https://support.google.com/accounts/answer/6010255?hl=en#zippy=%2Cif-less-secure-app-access-is-off-for-your-account), altrimenti google non è in grado di accedere tramite Node
- Riattivare il transported nel file index.ts. Più o meno a riga 170 c'è un commento che parla del server mail.
- Inserire, dove occorre, l'invio delle email. L'unico punto in cui veniva fatto prima della disabilitazione era in auth.ts circa a riga 90, ovvero nella funzione "recoverPassword" (ovvero l'endpoint per il recupero della password di un utente).