package com.ft.trans.dto;

import java.util.ArrayList;
import java.util.List;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

public class ProfileStacksResponseDTO implements IEntity {
    public String profile_id;
    public List<String> stacks = new ArrayList<>();

    @Override
    public ValidationResult validate() {
        return new ValidationResult();
    }
}
