#!/bin/bash
#
ssh -L 3000:localhost:3000 -Nf pad152@thompson.cs.pitt.edu
ssh -L 4000:localhost:4000 -Nf pad152@ritchie.cs.pitt.edu
ssh -L 4001:localhost:4001 -Nf pad152@kernighan.cs.pitt.edu
ssh -L 4002:localhost:4002 -Nf pad152@kernighan.cs.pitt.edu
ssh -L 4003:localhost:4003 -Nf pad152@kernighan.cs.pitt.edu
ssh -L 4004:localhost:4004 -Nf pad152@kernighan.cs.pitt.edu
