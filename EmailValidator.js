/**
 * Created by Cauani Castro
 * Version 1.0
 *
 * A simple finite state machine for correct mail validation (under RFC 3696, 2822, 2821, 1035 and 1034)
 *
 * Next versions: validate if the mailbox do exist
 * @param mail
 * @constructor
 */
function MailValidator(mail) {
    this.mail = mail;
    this.localpart = "";
    this.localpartQ = 0;
    this.domain = "";
    this.domainQ = 0;
    this.Q = 0;
    this.valid = false;
    this.error = "";

    this.validCharsLocal = function (c) {
        var code = c.charCodeAt();
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) // lower alpha (a-z)
        {
            if (!(c == "!" || c == "#" || c == "$" || c == "%" || c == "'" || c == "*" || c == "+" || c == "-"
                || c == "/" || c == "=" || c == "?" || c == "^" || c == "_" || c == "`" || c == "{" || c == "|" || c == "}" || c == "~")) {
                return false;
            }

        }
        return true;
    };

    this.l_first = function (c) {
        if (c == ".")
            throw Error("Cannot start with a .");
        else if (c == "@")
            throw Error("Localpart cannot be empty");
        else if (c == "\"") {
            this.localpart += c;
            return this.l_quoted;
        }
        else if (this.validCharsLocal(c)) {
            this.localpart += c;
            return this.l_label;
        }
        else if (c == "")
            throw Error("Empty email");
        else {
            throw Error("Illegal char");
        }
    };

    this.l_label = function (c) {
        if (c == ".") {
            this.localpart += c;
            return this.l_dot;
        }
        else if (c == "@") {
            return this.d_first;
        }
        else if (c == "\"") {
            throw Error("Cannot have quotes in the middle of a label");
        }
        else if (this.validCharsLocal(c)) {
            this.localpart += c;
            return this.l_label;
        }
        else if (c == "")
            throw Error("Premature end of email")
        else {
            throw Error("Illegal char");
        }
    };

    this.l_dot = function (c) {
        if (c == ".")
            throw Error(". cannot precede a .");
        else if (c == "@")
            throw Error("Localpart cannot end with a .");
        else if (c == "\"") {
            this.localpart += c;
            return this.l_quoted;
        }
        else if (this.validCharsLocal(c)) {
            this.localpart += c;
            return this.l_label;
        }
        else if (c == "")
            throw Error("Premature end of email")
        else {
            throw Error("Illegal char");
        }
    }

    this.l_quoted = function (c) {
        if (c == "\"") {
            this.localpart += c;
            return this.l_post_quote;
        }
        else if (c == "\\") {
            return this.l_escape_quote;
        }
        else if (c == "")
            throw Error("Premature end of email")
        else {
            var code = c.charCodeAt();
            if (code == 10 || code == 13 || code == 32 || (code >= 91 && code <= 94))
                throw Error("Illegal char");

            else {
                this.localpart += c;
                return this.l_quoted;
            }
        }
    };

    this.l_post_quote = function (c) {
        if (c == "@") {
            return this.d_first;
        }
        else if (c == ".") {
            this.localpart += c;
            return this.l_dot;
        }
        else if (c == "")
            throw Error("Premature end of email")
        else
            throw Error("Illegal char");
    };

    this.l_escape_quote = function (c) {
        var code = c.charCodeAt();
        if (code == 10 || code == 13)
            throw Error("Illegal char");
        else if (c == "")
            throw Error("Premature end of email")
        else {
            this.localpart += c;
            return this.l_quoted;
        }
    };

    this.d_first = function (c) {
        if (c == ".")
            throw Error("Domain name cannot start with a .");
        if (c == "-")
            throw Error("Domain name cannot start with a -");
        if (c == "[") {
            this.domain += c;
            return this.d_bracketed;
        }
        else if (this.validCharsLocal(c)) {
            this.domain += c;
            return this.d_label;
        }
        else if (c == "")
            throw Error("Domain can't be empty.")
        else {
            throw Error("Illegal char");
        }
    };

    this.d_period = function (c) {
        if (c == "")
            throw Error("A domain cannot end with a .");
        if (c == ".")
            throw Error(". cannot precede a .");
        if (c == "-")
            throw Error("Cannot start with a -");
        else if (this.validCharsLocal(c)) {
            this.domain += c;
            return this.d_label;
        }
        else {
            throw Error("Illegal char");
        }
    };

    this.d_hyphen = function (c) {
        if (c == ".")
            throw Error("A label cannot end with a hyphen.");
        else if (c == "-")
            throw Error("- cannot precede a -");
        else if (c == "")
            throw Error("A domain can't end with a hyphen.")
        else if (this.validCharsLocal(c)) {
            this.domain += c;
            return this.d_label;
        }
        else {
            throw Error("Illegal char");
        }
    };

    this.d_label = function (c) {
        if (c == ".") {
            this.domain += c;
            return this.d_period;
        }
        else if (c == "-") {
            this.domain += c;
            return this.d_hyphen;
        }
        else if (this.validCharsLocal(c)) {
            this.domain += c;
            return this.d_label;
        }
        else if (c == ":") {
            this.domain += c;
            return this.d_label;
        }
        else if (c == "") {
            return null;
        }
        else {
            throw Error("Illegal char");
        }
    };

    this.d_bracketed = function (c) {
        if (c == "]") {
            this.domain += c;
            return this.d_post_bracket;
        }
        else if (c == "\\") {
            return this.d_escape;
        }
        else if (c == "")
            throw Error("Premature end of email")
        else {
            var code = c.charCodeAt();
            if (code == 10 || code == 13 || code == 32 || (code >= 91 && code <= 94))
                throw Error("Illegal char");
            else {
                this.domain += c;
                return this.d_bracketed;
            }
        }
    };

    this.d_escape = function (c) {
        var code = c.charCodeAt();
        if (code == 10 || code == 13)
            throw Error("Illegal char");
        else if (c == "")
            throw Error("Premature end of email")
        else {
            this.domain += c;
            return this.d_bracketed;
        }
    };

    this.d_post_bracket = function (c) {
        if (c == "") {
            return null;
        }
        else {
            throw Error("A bracketed domain must end with a bracket");
        }
    };

    this.currentState = this.l_first;
    this.previousState = null;

    this._validate_localpart = function () {
        if (this.localpart.length > 64)
            throw Error("Localpart can't have more than 64 characters.");
    };

    this._validate_domain = function () {
        if ((this.domain[0] == "[" && this.domain[this.domain.length - 1] == "]") && this.domain.length > 255)
            throw Error("Domain can't have more than 255 characters.");
        else if (this.domain.length > 253)
            throw Error("Domain can't have more than 253 characters.");
        // Testing for size of labels
        var aux = this.domain;
        if (aux[0] == "[" && aux[aux.length - 1] == "]")
            aux = aux.substr(1, aux.length - 2);
        var aux = this.domain.split(".");

        if (aux.length == 1)
            throw Error("Domain labels invalid");

        for (var i = 0; i < aux.length; i++) {
            if (aux[i].length > 63)
                throw Error("Domain labels can' have more than 63 characters");
        }

        // Testing for last label rule
        for (var i = 0; i < aux[aux.length - 1].length; i++) {
            var c = aux[aux.length - 1][i];
            var code = c.charCodeAt();
            if (!(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123)) // lower alpha (a-z)
            {
                throw Error("Domain's last label can only have alphabetic characters.");
            }
        }
    };

    this._validate_whole = function () {
        var aux = this.localpart + "@" + this.domain;
        if (aux.length > 320)
            throw Error("The maximum allowable length of an email is 320 characters.");
    }

    this.validate = function () {
        try {
            var aux = this.mail.length;
            for (i = 0; i <= aux; i++) {
                var aux_i = this.mail[i] || "";
                this.currentState = this.currentState(aux_i);
                if (this.currentState == null)
                    break;
                this.Q++;
            }
            this._validate_localpart();
            this._validate_domain();
            this._validate_whole();

            return true;
        }
        catch (ex) {
            this.error = ex.message;
            return false;
        }
        return false;
    };

    this.getMail = function () {
        if (this.valid || this.validate()) {
            return this.localpart + "@" + this.domain;
        }
        return "";
    }
}
