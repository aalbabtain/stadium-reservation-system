document.addEventListener('DOMContentLoaded', () => { 
    const logoutBtn = document.getElementById('logoutBtn'); 
    if (logoutBtn) { 
        logoutBtn.addEventListener('click', () => { 
            fetch('../backend/Authentication/logout.php') 
                .then(res => res.json()) 
                .then(data => { 
                    if (data.status === 'success') { 
                        window.location.href = 'index.html'; 
                    } else { 
                        alert("Logout failed: " + data.message); 
                    } 
                }) 
                .catch(err => { 
                    console.error("Logout error:", err); 
                    alert("An error occurred during logout."); 
                }); 
        }); 
    } 
 
    loadStadiums(); 
    loadStadiumSelect();
    loadStatistics();

    const addStadiumForm = document.getElementById('addStadiumForm'); 
    if (addStadiumForm) { 
        addStadiumForm.addEventListener('submit', e => { 
            e.preventDefault(); 
            const formData = new FormData(e.target); 
 
            fetch('../backend/Stadiums_Slots/add_stadium.php', { 
                method: 'POST', 
                body: formData 
            }) 
                .then(res => res.json()) 
                .then(data => { 
                    alert(data.message); 
                    if (data.status === 'success') { 
                        e.target.reset(); 
                        loadStadiums(); 
                        loadStadiumSelect();
                        loadStatistics();
                    } 
                }) 
                .catch(err => { 
                    console.error("Add stadium error:", err); 
                    alert("Failed to add stadium."); 
                }); 
        }); 
    } 

    const addSlotForm = document.getElementById('addSlotForm'); 
    if (addSlotForm) { 
        addSlotForm.addEventListener('submit', e => { 
            e.preventDefault(); 
            const formData = new FormData(addSlotForm); 
 
            fetch('../backend/Stadiums_Slots/add_slots.php', { 
                method: 'POST', 
                body: formData 
            }) 
                .then(res => res.json()) 
                .then(data => { 
                    alert(data.message); 
                    if (data.status === 'success') { 
                        addSlotForm.reset();
                        loadStadiums();
                        loadStatistics();
                    } 
                }) 
                .catch(err => { 
                    console.error("Add slot error:", err); 
                    alert("Failed to add slot."); 
                }); 
        }); 
    } 
}); 
 
function loadStadiums() {  
    fetch('../backend/Stadiums_Slots/dashboard.php')  
        .then(res => res.json())  
        .then(data => {  
            const tbody = document.querySelector('#stadiumTable tbody');  
            if (tbody) {  
                tbody.innerHTML = '';
                
                if (data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No stadiums added yet</td></tr>';
                    return;
                }
                
                data.forEach(stadium => {  
                    const totalSlots = parseInt(stadium.total_slots) || 0;
                    const reservedSlots = parseInt(stadium.reserved_slots) || 0;
                    const availableSlots = totalSlots - reservedSlots;
                    const photoUrl = stadium.photo || 'https://via.placeholder.com/80x60?text=No+Image'; //if there is no photo it shows Default image

                    tbody.innerHTML += `  
                        <tr>  
                            <td><img src="${photoUrl}" alt="Stadium" class="stadium-img" onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'"></td>  
                            <td><strong>${stadium.name}</strong></td>  
                            <td>${stadium.location}</td>  
                            <td>${stadium.description || 'N/A'}</td>  
                            <td><span class="badge bg-info">${totalSlots}</span></td>  
                            <td><span class="badge bg-danger">${reservedSlots}</span></td>  
                            <td><span class="badge bg-success">${availableSlots}</span></td>  
                        </tr>`;  
                });  
            }  
        })  
        .catch(err => {  
            console.error("Failed to load stadiums:", err);  
        });  
} 
 
function loadStadiumSelect() { 
    fetch('../backend/Stadiums_Slots/get_stadiums.php') 
        .then(res => res.json()) 
        .then(data => { 
            const select = document.getElementById('stadiumSelect'); 
            if (select) { 
                select.innerHTML = '<option value="">Choose Stadium...</option>'; 
                if (data.stadiums && data.stadiums.length > 0) {
                    data.stadiums.forEach(stadium => { 
                        const option = document.createElement('option'); 
                        option.value = stadium.id; 
                        option.textContent = stadium.name + ' - ' + stadium.location; 
                        select.appendChild(option); 
                    });
                }
            } 
        }) 
        .catch(err => { 
            console.error("Failed to load stadiums into select:", err); 
        }); 
}

function loadStatistics() {
    fetch('../backend/Stadiums_Slots/dashboard.php')
        .then(res => res.json())
        .then(data => {
            const totalStadiums = data.length;
            let totalReservations = 0;
            let totalSlots = 0;
            
            data.forEach(stadium => {
                totalReservations += parseInt(stadium.reserved_slots || 0);
                totalSlots += parseInt(stadium.total_slots || 0);
            });
            
            document.getElementById('totalStadiums').textContent = totalStadiums;
            document.getElementById('totalReservations').textContent = totalReservations;
            document.getElementById('totalSlots').textContent = totalSlots;
        })
        .catch(err => {
            console.error("Failed to load statistics:", err);
        });
}
