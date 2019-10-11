# jstools
Bunch of JS utils I've developed for whatever reason

###### EmailValidator
An FSM to validate emails under the RFCs (3696, 2822, 2821, 1035 and 1034).
Usage is as follow:

```
const mail = new MailValidator('user_email@domain.com')
mail.validate()
if (mail){
  ...
}
```
