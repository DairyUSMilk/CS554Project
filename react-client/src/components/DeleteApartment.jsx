import React from 'react';
import { useMutation } from "@apollo/client";
import { getLandlord } from '../graphql/Queries';
import { deleteApartment } from '../graphql/Mutations';

import Button from 'react-bootstrap/Button';
import '../index.css';

function DeleteApartment ({apartment}) {
    const [removeApartment, { loading, error }] = useMutation(deleteApartment(), {
        variables: {uid: apartment.id},
        refetchQueries: [
            { query: getLandlord(), variables: { uid: apartment.landlord.uid }}
        ]
    });

    function handleDelete() {
        removeApartment();
    }
    
    if (loading) { 
        return (
        <div>
            <h2>Deleting Apartment....</h2>
        </div>);
        }
    
    if (error) {
        return (
            <div>
                <h2>Error Deleting Apartment! {error.message}</h2>
            </div>
        );
    }
     
    return (
        <Button 
            variant="primary"
            onClick={handleDelete}
            >
            Delete
        </Button>
        );
    }
    
    export default DeleteApartment;