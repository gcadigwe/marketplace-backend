export const code = `
{parameter (or
    (or
      (or %admin (or (unit %confirm_admin) (bool %pause)) (address %set_admin))
      (or %assets
        (or
          (pair %balance_of
            (list %requests (pair (address %owner) (nat %token_id)))
            (contract %callback (list (pair
                                      (pair %request (address %owner)
                                                     (nat %token_id))
                                      (nat %balance)))))
          (list %transfer (pair (address %from_)
                               (list %txs (pair (address %to_)
                                               (pair (nat %token_id)
                                                     (nat %amount)))))))
        (list %update_operators (or
                                 (pair %add_operator (address %owner)
                                                     (pair (address %operator)
                                                           (nat %token_id)))
                                 (pair %remove_operator (address %owner)
                                                        (pair
                                                          (address %operator)
                                                          (nat %token_id)))))))
    (or %tokens
      (pair %create_token (nat %token_id) (map %token_info string bytes))
      (list %mint_tokens (pair (address %owner)
                              (pair (nat %token_id) (nat %amount))))));
storage (pair
  (pair
    (pair %admin (pair (address %admin) (bool %paused))
                 (option %pending_admin address))
    (pair %assets
      (pair (big_map %ledger (pair address nat) nat)
            (big_map %operators (pair address (pair address nat)) unit))
      (pair
        (big_map %token_metadata nat
                                 (pair (nat %token_id)
                                       (map %token_info string bytes)))
        (big_map %token_total_supply nat nat))))
  (big_map %metadata string bytes));
code { PUSH string "FA2_TOKEN_UNDEFINED" ;
LAMBDA
 (pair (pair address nat) (big_map (pair address nat) nat))
 nat
 { { { DUP ; CAR ; DIP { CDR } } } ; GET ; IF_NONE { PUSH nat 0 } {} } ;
DUP ;
LAMBDA
 (pair (lambda (pair (pair address nat) (big_map (pair address nat) nat)) nat)
       (pair (pair address nat) (pair nat (big_map (pair address nat) nat))))
 (big_map (pair address nat) nat)
 { { { DUP ; CAR ; DIP { CDR } } } ;
   SWAP ;
   { { DUP ; CAR ; DIP { CDR } } } ;
   { { DUP ; CAR ; DIP { CDR } } } ;
   DIG 2 ;
   { { DUP ; CAR ; DIP { CDR } } } ;
   DIG 3 ;
   DIG 3 ;
   PAIR ;
   { DIP 2 { DUP } ; DIG 3 } ;
   SWAP ;
   DUP ;
   DUG 2 ;
   PAIR ;
   DIG 4 ;
   SWAP ;
   EXEC ;
   DIG 2 ;
   ADD ;
   PUSH nat 0 ;
   SWAP ;
   DUP ;
   DUG 2 ;
   COMPARE ;
   EQ ;
   IF
     { DROP ; NONE nat ; SWAP ; UPDATE }
     { DIG 2 ; SWAP ; SOME ; DIG 2 ; UPDATE } } ;
SWAP ;
APPLY ;
LAMBDA
 (pair (pair address bool) (option address))
 unit
 { CAR ;
   CAR ;
   SENDER ;
   COMPARE ;
   NEQ ;
   IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } } ;
DIG 4 ;
{ { DUP ; CAR ; DIP { CDR } } } ;
IF_LEFT
 { IF_LEFT
     { DIG 3 ;
       DIG 4 ;
       DIG 5 ;
       DROP 3 ;
       SWAP ;
       DUP ;
       DUG 2 ;
       CAR ;
       CAR ;
       SWAP ;
       IF_LEFT
         { IF_LEFT
             { DIG 3 ;
               DROP 2 ;
               DUP ;
               CDR ;
               IF_NONE
                 { DROP ; PUSH string "NO_PENDING_ADMIN" ; FAILWITH }
                 { SENDER ;
                   COMPARE ;
                   EQ ;
                   IF
                     { NONE address ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR }
                     { DROP ; PUSH string "NOT_A_PENDING_ADMIN" ; FAILWITH } } ;
               NIL operation ;
               PAIR }
             { SWAP ;
               DUP ;
               DUG 2 ;
               DIG 4 ;
               SWAP ;
               EXEC ;
               DROP ;
               SWAP ;
               DUP ;
               DUG 2 ;
               CDR ;
               SWAP ;
               DIG 2 ;
               CAR ;
               CAR ;
               PAIR ;
               PAIR ;
               NIL operation ;
               PAIR } }
         { SWAP ; DUP ; DUG 2 ; DIG 4 ; SWAP ; EXEC ; DROP ; SOME ; SWAP ; CAR ; PAIR ; NIL operation ; PAIR } ;
       { { DUP ; CAR ; DIP { CDR } } } ;
       { DIP 2 { DUP } ; DIG 3 } ;
       CDR ;
       DIG 3 ;
       CAR ;
       CDR ;
       DIG 3 ;
       PAIR ;
       PAIR ;
       SWAP ;
       PAIR }
     { DIG 2 ;
       DROP ;
       SWAP ;
       DUP ;
       DUG 2 ;
       CAR ;
       CAR ;
       CAR ;
       CDR ;
       IF { PUSH string "PAUSED" ; FAILWITH } {} ;
       SWAP ;
       DUP ;
       DUG 2 ;
       CAR ;
       CDR ;
       SWAP ;
       IF_LEFT
         { IF_LEFT
             { DIG 3 ;
               DROP ;
               SWAP ;
               DUP ;
               DUG 2 ;
               CDR ;
               CAR ;
               { DIP 2 { DUP } ; DIG 3 } ;
               CAR ;
               CAR ;
               DIG 2 ;
               DUP ;
               CAR ;
               MAP { { DIP 3 { DUP } ; DIG 4 } ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     MEM ;
                     NOT ;
                     IF
                       { DROP ; { DIP 6 { DUP } ; DIG 7 } ; FAILWITH }
                       { { DIP 2 { DUP } ; DIG 3 } ;
                         SWAP ;
                         DUP ;
                         DUG 2 ;
                         CDR ;
                         { DIP 2 { DUP } ; DIG 3 } ;
                         CAR ;
                         PAIR ;
                         PAIR ;
                         { DIP 7 { DUP } ; DIG 8 } ;
                         SWAP ;
                         EXEC ;
                         SWAP ;
                         PAIR } } ;
               DIG 2 ;
               DIG 3 ;
               DIG 6 ;
               DIG 7 ;
               DROP 4 ;
               SWAP ;
               CDR ;
               PUSH mutez 0 ;
               DIG 2 ;
               TRANSFER_TOKENS ;
               SWAP ;
               NIL operation ;
               DIG 2 ;
               CONS ;
               PAIR }
             { SWAP ;
               DUP ;
               DUG 2 ;
               LAMBDA
                 (pair (pair address address)
                       (pair nat
                             (big_map (pair address (pair address nat)) unit)))
                 unit
                 { { { DUP ; CAR ; DIP { CDR } } } ;
                   { { DUP ; CAR ; DIP { CDR } } } ;
                   DIG 2 ;
                   { { DUP ; CAR ; DIP { CDR } } } ;
                   { DIP 3 { DUP } ; DIG 4 } ;
                   { DIP 3 { DUP } ; DIG 4 } ;
                   COMPARE ;
                   EQ ;
                   IF
                     { DROP 4 ; UNIT }
                     { DIG 3 ;
                       PAIR ;
                       DIG 2 ;
                       PAIR ;
                       MEM ;
                       IF
                         { UNIT }
                         { PUSH string "FA2_NOT_OPERATOR" ; FAILWITH } } } ;
               DIG 2 ;
               { DIP 2 { DUP } ; DIG 3 } ;
               CAR ;
               CAR ;
               SWAP ;
               ITER { DUP ;
                      DUG 2 ;
                      CDR ;
                      ITER { SWAP ;
                             { DIP 4 { DUP } ; DIG 5 } ;
                             CDR ;
                             CAR ;
                             { DIP 2 { DUP } ; DIG 3 } ;
                             GET 3 ;
                             MEM ;
                             NOT ;
                             IF
                               { DROP 2 ; { DIP 7 { DUP } ; DIG 8 } ; FAILWITH }
                               { { DIP 4 { DUP } ; DIG 5 } ;
                                 CAR ;
                                 CDR ;
                                 { DIP 2 { DUP } ; DIG 3 } ;
                                 GET 3 ;
                                 PAIR ;
                                 SENDER ;
                                 { DIP 4 { DUP } ; DIG 5 } ;
                                 CAR ;
                                 PAIR ;
                                 PAIR ;
                                 { DIP 4 { DUP } ; DIG 5 } ;
                                 SWAP ;
                                 EXEC ;
                                 DROP ;
                                 SWAP ;
                                 DUP ;
                                 DUG 2 ;
                                 GET 4 ;
                                 PAIR ;
                                 SWAP ;
                                 DUP ;
                                 DUG 2 ;
                                 GET 3 ;
                                 { DIP 3 { DUP } ; DIG 4 } ;
                                 CAR ;
                                 DIG 2 ;
                                 { { DUP ; CAR ; DIP { CDR } } } ;
                                 DIG 3 ;
                                 DIG 3 ;
                                 PAIR ;
                                 { DIP 2 { DUP } ; DIG 3 } ;
                                 SWAP ;
                                 DUP ;
                                 DUG 2 ;
                                 PAIR ;
                                 { DIP 11 { DUP } ; DIG 12 } ;
                                 SWAP ;
                                 EXEC ;
                                 DIG 2 ;
                                 SWAP ;
                                 SUB ;
                                 ISNAT ;
                                 IF_NONE
                                   { DROP 2 ;
                                     PUSH string "FA2_INSUFFICIENT_BALANCE" ;
                                     FAILWITH }
                                   { PUSH nat 0 ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     COMPARE ;
                                     EQ ;
                                     IF
                                       { DROP ; NONE nat ; SWAP ; UPDATE }
                                       { DIG 2 ; SWAP ; SOME ; DIG 2 ; UPDATE } } ;
                                 SWAP ;
                                 DUP ;
                                 DUG 2 ;
                                 GET 4 ;
                                 PAIR ;
                                 SWAP ;
                                 DUP ;
                                 DUG 2 ;
                                 GET 3 ;
                                 DIG 2 ;
                                 CAR ;
                                 PAIR ;
                                 PAIR ;
                                 { DIP 6 { DUP } ; DIG 7 } ;
                                 SWAP ;
                                 EXEC } } ;
                      SWAP ;
                      DROP } ;
               SWAP ;
               DIG 2 ;
               DIG 5 ;
               DIG 6 ;
               DIG 7 ;
               DROP 5 ;
               SWAP ;
               DUP ;
               DUG 2 ;
               CDR ;
               DIG 2 ;
               CAR ;
               CDR ;
               DIG 2 ;
               PAIR ;
               PAIR ;
               NIL operation ;
               PAIR } }
         { DIG 3 ;
           DIG 4 ;
           DIG 5 ;
           DROP 3 ;
           SWAP ;
           DUP ;
           DUG 2 ;
           CAR ;
           CDR ;
           SWAP ;
           SENDER ;
           DUG 2 ;
           ITER { SWAP ;
                  { DIP 2 { DUP } ; DIG 3 } ;
                  { DIP 2 { DUP } ; DIG 3 } ;
                  IF_LEFT {} {} ;
                  CAR ;
                  COMPARE ;
                  EQ ;
                  IF {} { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ;
                  SWAP ;
                  IF_LEFT
                    { SWAP ;
                      UNIT ;
                      SOME ;
                      { DIP 2 { DUP } ; DIG 3 } ;
                      GET 4 ;
                      { DIP 3 { DUP } ; DIG 4 } ;
                      GET 3 ;
                      PAIR ;
                      DIG 3 ;
                      CAR ;
                      PAIR ;
                      UPDATE }
                    { DUP ;
                      DUG 2 ;
                      GET 4 ;
                      { DIP 2 { DUP } ; DIG 3 } ;
                      GET 3 ;
                      PAIR ;
                      DIG 2 ;
                      CAR ;
                      PAIR ;
                      NONE unit ;
                      SWAP ;
                      UPDATE } } ;
           SWAP ;
           DROP ;
           SWAP ;
           DUP ;
           DUG 2 ;
           CDR ;
           SWAP ;
           DIG 2 ;
           CAR ;
           CAR ;
           PAIR ;
           PAIR ;
           NIL operation ;
           PAIR } ;
       { { DUP ; CAR ; DIP { CDR } } } ;
       { DIP 2 { DUP } ; DIG 3 } ;
       CDR ;
       DIG 2 ;
       DIG 3 ;
       CAR ;
       CAR ;
       PAIR ;
       PAIR ;
       SWAP ;
       PAIR } }
 { DIG 4 ;
   DROP ;
   SWAP ;
   DUP ;
   DUG 2 ;
   CAR ;
   CAR ;
   DIG 3 ;
   SWAP ;
   EXEC ;
   DROP ;
   SWAP ;
   DUP ;
   DUG 2 ;
   CAR ;
   CDR ;
   SWAP ;
   IF_LEFT
     { DIG 3 ;
       DIG 4 ;
       DROP 2 ;
       DUP ;
       CAR ;
       { DIP 2 { DUP } ; DIG 3 } ;
       CDR ;
       CAR ;
       SWAP ;
       DUP ;
       DUG 2 ;
       GET ;
       IF_NONE
         { { DIP 2 { DUP } ; DIG 3 } ;
           CDR ;
           CDR ;
           { DIP 3 { DUP } ; DIG 4 } ;
           CDR ;
           CAR ;
           DIG 3 ;
           { DIP 3 { DUP } ; DIG 4 } ;
           SWAP ;
           SOME ;
           SWAP ;
           UPDATE ;
           PAIR ;
           { DIP 2 { DUP } ; DIG 3 } ;
           CAR ;
           PAIR ;
           DIG 2 ;
           CDR ;
           CDR ;
           PUSH nat 0 ;
           DIG 3 ;
           SWAP ;
           SOME ;
           SWAP ;
           UPDATE ;
           SWAP ;
           DUP ;
           DUG 2 ;
           CDR ;
           CAR ;
           PAIR ;
           SWAP ;
           CAR ;
           PAIR }
         { DROP 4 ; PUSH string "FA2_DUP_TOKEN_ID" ; FAILWITH } ;
       NIL operation ;
       PAIR }
     { SWAP ;
       DUP ;
       DUG 2 ;
       CAR ;
       CAR ;
       SWAP ;
       DUP ;
       DUG 2 ;
       ITER { DUP ;
              DUG 2 ;
              GET 4 ;
              PAIR ;
              SWAP ;
              DUP ;
              DUG 2 ;
              GET 3 ;
              DIG 2 ;
              CAR ;
              PAIR ;
              PAIR ;
              { DIP 4 { DUP } ; DIG 5 } ;
              SWAP ;
              EXEC } ;
       DIG 4 ;
       DROP ;
       { DIP 2 { DUP } ; DIG 3 } ;
       CDR ;
       CDR ;
       DIG 2 ;
       ITER { SWAP ;
              DUP ;
              { DIP 2 { DUP } ; DIG 3 } ;
              GET 3 ;
              GET ;
              IF_NONE
                { DROP 2 ; { DIP 3 { DUP } ; DIG 4 } ; FAILWITH }
                { { DIP 2 { DUP } ; DIG 3 } ; GET 4 ; ADD ; SOME ; DIG 2 ; GET 3 ; UPDATE } } ;
       DIG 4 ;
       DROP ;
       { DIP 2 { DUP } ; DIG 3 } ;
       CDR ;
       DIG 3 ;
       CAR ;
       CDR ;
       DIG 3 ;
       PAIR ;
       PAIR ;
       DUP ;
       DUG 2 ;
       CDR ;
       CAR ;
       PAIR ;
       SWAP ;
       CAR ;
       PAIR ;
       NIL operation ;
       PAIR } ;
   { { DUP ; CAR ; DIP { CDR } } } ;
   { DIP 2 { DUP } ; DIG 3 } ;
   CDR ;
   DIG 2 ;
   DIG 3 ;
   CAR ;
   CAR ;
   PAIR ;
   PAIR ;
   SWAP ;
   PAIR } }}`;
