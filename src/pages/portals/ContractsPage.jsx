import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Toolbar
} from "@mui/material";
import { getContracts, executeOffers } from "../../services/AxiosTrading";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../../components/mainComponents/Sidebar";

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState("valid");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    }

    const fetchContracts = async () => {
      try {
        const res = await getContracts();
        setContracts(res.data || []);
      } catch (error) {
        console.error("Greška pri učitavanju ugovora:", error);
      }
    };

    fetchContracts();
  }, []);

  const isValid = (contract) => {
    const today = new Date();
    const settlementDate = new Date(contract.SettlementAt);
    return settlementDate >= today;
  };

  const handleExecute = async (id) => {
    try {
      await executeOffers(id);
      window.location.reload();
    } catch (error) {
      console.error("Greška pri izvršavanju ugovora:", error);
    }
  };

  const filteredContracts = contracts.filter((c) =>
    filter === "valid" ? isValid(c) : !isValid(c)
  );

  const buyerContracts = filteredContracts.filter((c) => c.BuyerID === userId);
  const sellerContracts = filteredContracts.filter((c) => c.SellerID === userId);

  const renderContracts = (title, data, showExecute = false) => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {data.map((contract) => {
          const sec = contract.portfolio?.security || {};
          const expired = !isValid(contract);

          return (
            <Grid item xs={12} sm={6} md={4} key={contract.ID}>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor: expired ? "#f5f5f5" : "inherit",
                  position: "relative",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    {sec.ticker} - {sec.name}
                  </Typography>

                  {expired && (
                    <Chip
                      label="Expired"
                      color="default"
                      size="small"
                      sx={{ position: "absolute", top: 16, right: 16 }}
                    />
                  )}

                  <Divider sx={{ my: 1 }} />
                  <Typography>
                    <strong>Quantity:</strong> {contract.Quantity}
                  </Typography>
                  <Typography>
                    <strong>Strike price:</strong> ${contract.StrikePrice}
                  </Typography>
                  <Typography>
                    <strong>Premium:</strong> ${contract.Premium}
                  </Typography>
                  <Typography>
                    <strong>Settlement:</strong>{" "}
                    {new Date(contract.SettlementAt).toLocaleDateString()}
                  </Typography>

                  {!expired && showExecute && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleExecute(contract.ID)}
                      >
                        Execute
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Sklopljeni OTC Ugovori
        </Typography>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, val) => val && setFilter(val)}
          sx={{ mb: 4 }}
        >
          <ToggleButton value="valid">Valid</ToggleButton>
          <ToggleButton value="expired">Expired</ToggleButton>
        </ToggleButtonGroup>

        {renderContracts("As buyer", buyerContracts, true)}
        {renderContracts("As seller", sellerContracts, false)}
      </Box>
    </Box>
  );
};

export default ContractsPage;
