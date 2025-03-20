import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import {createOrder} from "../../services/AxiosTrading";
import MenuItem from "@mui/material/MenuItem";
import {fetchAccountsForUser, getUserIdFromToken} from "../../services/AxiosBanking";

const BuyModal = ({ open, onClose, selectedSecurity }) => {
    const [quantity, setQuantity] = useState(1);
    const [limitValue, setLimitValue] = useState("");
    const [stopValue, setStopValue] = useState("");
    const [allOrNone, setAllOrNone] = useState(false);
    const [margin, setMargin] = useState(false);
    const [isOverview, setIsOverview] = useState(false);
    const [orderType, setOrderType] = useState("market");
    const approximatePrice = selectedSecurity.contract_size * selectedSecurity.price_per_unit * quantity;
    const [accounts, setAccounts] = useState([]);
    const [outflowAccount, setOutflowAccount] = useState('');


    //racuni klijenta
    useEffect(() => {
        const getAccounts = async () => {
            try {
                const response = await fetchAccountsForUser();

                setAccounts(response);
                console.log(accounts);

            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };
        getAccounts();
    }, []);

    // ako je account selektovan, uzima se valuta
    const selectedOutflow = accounts.find(acc => acc.id === outflowAccount);
    const currency = selectedOutflow ? selectedOutflow.currencyType : '';

    //resetovanje modala
    useEffect(() => {
        if (!open) {
            setOutflowAccount("");
            setQuantity(1);
            setLimitValue("");
            setStopValue("");
            setAllOrNone(false);
            setMargin(false);
            setIsOverview(false);
            setOrderType("market");
        }
    }, [open]);

    //odredjivanje tipa ordera na osnovu limita i stopa
    useEffect(() => {
        if (limitValue && stopValue) {
            setOrderType("stop-limit");
        } else if (limitValue) {
            setOrderType("limit");
        } else if (stopValue) {
            setOrderType("stop");
        } else {
            setOrderType("market");
        }
    }, [limitValue, stopValue]);

    //kolicina ne moze da bude manja od 1
    const handleQuantityChange = (event) => {
        const value = event.target.value;
        if (value >= 1) {
            setQuantity(value);
        }
    };

   //post zahtev, proveriti orderData
    const handleConfirm = async () => {
        const orderData = {
            user_id: getUserIdFromToken(),
            security_id: selectedSecurity.id,
            order_type: orderType,
            quantity: quantity,
            contract_size: selectedSecurity.contract_size,
            price_per_unit: selectedSecurity.price_per_unit,
            direction: "buy",
        };
        console.log("Order Data:", orderData);

        try {
            const result = await createOrder(orderData);
            console.log("Order created successfully:", result);
            onClose();
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="buy-modal-title">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    textAlign: "center",
                }}
            >
                {!isOverview ? (
                    <>
                        <Typography id="buy-modal-title" variant="h6">
                            Buy Security
                        </Typography>

                        {/* Account Select */}
                        <TextField
                            id="outflow-account"
                            select
                            label="Select Account"
                            value={outflowAccount}
                            onChange={(e) => {
                                setOutflowAccount(Number(e.target.value));
                            }}
                            fullWidth
                            variant="standard"

                        >
                            {accounts.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.accountNumber}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Quantity */}
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            inputProps={{ min: 1 }}
                            fullWidth
                            sx={{ mt: 2 }}
                            variant="standard"

                        />

                        {/* Limit Value */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="Limit Value"
                            type="number"
                            value={limitValue}
                            onChange={(e) => setLimitValue(e.target.value)}
                            fullWidth
                            sx={{ mt: 2 }}
                            variant="standard"

                        />
                        <Typography variant="body1">
                            {currency} {/* valuta koju ima account */}
                        </Typography>
                        </Box>

                        {/* Stop Value */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="Stop Value"
                            type="number"
                            value={stopValue}
                            onChange={(e) => setStopValue(e.target.value)}
                            fullWidth
                            sx={{ mt: 2 }}
                            variant="standard"

                        />
                        <Typography variant="body1">
                            {currency} {/* valuta koju ima account */}
                        </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", mt: 2 }}>
                            <FormControlLabel
                                control={<Checkbox checked={allOrNone} onChange={(e) => setAllOrNone(e.target.checked)} />}
                                label="All or None"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={margin} onChange={(e) => setMargin(e.target.checked)} />}
                                label="Margin"
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                            <Button variant="outlined" color="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsOverview(true)}
                            >
                                Continue
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h6">Order Overview</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <strong>Quantity:</strong> {quantity}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Order Type:</strong> {orderType}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Approximate Price:</strong> {approximatePrice.toFixed(2)} {currency}
                        </Typography>

                        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                            <Button variant="outlined" color="secondary" onClick={() => setIsOverview(false)}>
                                Back
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleConfirm}>
                                Confirm
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default BuyModal;
