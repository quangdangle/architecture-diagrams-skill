// UART transmitter and receiver, old-style port declarations.
module uart(clk, rst_n, rx, tx, irq, data);
  input clk;
  input rst_n, rx;
  output reg tx;
  output wire irq;
  inout [7:0] data;
  fifo #(.W(8)) u_txq (.clk(clk));
endmodule
