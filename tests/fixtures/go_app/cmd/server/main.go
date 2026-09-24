package main

import (
	"fmt"
	"example.com/demo/internal/api"
	mux "github.com/gorilla/mux"
)

func main() { fmt.Println(api.Name, mux.NewRouter()) }
